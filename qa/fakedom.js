// Minimal fake DOM, just enough surface area to execute the module-N.js
// files unmodified and drive them the way a browser would (click handlers,
// classList, innerHTML). Not a general-purpose DOM — only what our widgets
// actually use.

class FakeClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  add(c) { this.set.add(c); }
  remove(c) { this.set.delete(c); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    if (force === undefined) {
      if (this.set.has(c)) { this.set.delete(c); return false; }
      this.set.add(c); return true;
    }
    if (force) this.set.add(c); else this.set.delete(c);
    return force;
  }
  toString() { return [...this.set].join(' '); }
}

// Minimal HTML string -> FakeElement tree parser. Only handles what our
// widgets actually emit via innerHTML: flat or lightly-nested tags with
// simple quoted attributes, no self-closing tags, no comments.
function parseHTML(html) {
  const nodes = [];
  const tagRe = /<([a-zA-Z][\w-]*)((?:\s+[\w-]+="[^"]*")*)\s*>([\s\S]*?)<\/\1>/g;
  let lastIndex = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    if (m.index > lastIndex) {
      const text = html.slice(lastIndex, m.index);
      if (text) nodes.push(FakeElement.text(text));
    }
    const [, tag, attrsStr, inner] = m;
    const el = new FakeElement(tag);
    const attrRe = /([\w-]+)="([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(attrsStr))) el.setAttribute(am[1], am[2]);
    parseHTML(inner).forEach((c) => el.appendChild(c));
    nodes.push(el);
    lastIndex = tagRe.lastIndex;
  }
  if (lastIndex < html.length) {
    const text = html.slice(lastIndex);
    if (text) nodes.push(FakeElement.text(text));
  }
  return nodes;
}

class FakeElement {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    this.children = [];
    this.parent = null;
    this._attrs = {};
    this._listeners = {};
    this.classList = new FakeClassList(this);
    this.style = {};
    this._innerHTML = '';
    this.value = '';
    this.disabled = false;
    this.type = '';
    this.min = undefined;
    this.max = undefined;
  }

  get className() { return this.classList.toString(); }
  set className(v) {
    this.classList.set = new Set(String(v).split(/\s+/).filter(Boolean));
  }

  get id() { return this._attrs.id || ''; }
  set id(v) { this._attrs.id = v; }

  get textContent() {
    if (this.children.length) return this.children.map((c) => c.textContent || '').join('');
    return this._text || '';
  }
  set textContent(v) { this._text = v; this.children = []; this._innerHTML = v; }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(v) {
    this._innerHTML = v;
    this.children = parseHTML(v);
    this.children.forEach((c) => { c.parent = this; });
  }

  setAttribute(name, val) {
    this._attrs[name] = String(val);
    if (name === 'class') this.className = val;
  }
  getAttribute(name) { return this._attrs[name] ?? null; }
  removeAttribute(name) { delete this._attrs[name]; }

  appendChild(node) {
    if (typeof node === 'string') return this.appendChild(FakeElement.text(node));
    node.parent = this;
    this.children.push(node);
    return node;
  }
  append(...nodes) { nodes.forEach((n) => this.appendChild(n)); }

  addEventListener(evt, fn) {
    (this._listeners[evt] = this._listeners[evt] || []).push(fn);
  }
  removeEventListener(evt, fn) {
    if (!this._listeners[evt]) return;
    this._listeners[evt] = this._listeners[evt].filter((f) => f !== fn);
  }
  dispatch(evt, payload) {
    let result;
    (this._listeners[evt] || []).forEach((fn) => { result = fn(payload || {}); });
    return result;
  }
  click() { return this.dispatch('click'); }

  scrollIntoView() {}

  querySelector(sel) {
    const match = (el) => FakeElement.matches(el, sel);
    const search = (el) => {
      for (const child of el.children) {
        if (match(child)) return child;
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(this);
  }

  querySelectorAll(sel) {
    const out = [];
    const search = (el) => {
      for (const child of el.children) {
        if (FakeElement.matches(child, sel)) out.push(child);
        search(child);
      }
    };
    search(this);
    return out;
  }

  static matches(el, sel) {
    if (sel.startsWith('#')) return el._attrs.id === sel.slice(1);
    if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
    return el.tagName === sel.toUpperCase();
  }

  static text(str) {
    const el = new FakeElement('#text');
    el._text = str;
    return el;
  }
}

function createFakeDocument() {
  const body = new FakeElement('body');
  const listeners = {};

  const document = {
    body,
    _listeners: listeners,
    createElement: (tag) => new FakeElement(tag),
    querySelector: (sel) => body.querySelector(sel),
    querySelectorAll: (sel) => body.querySelectorAll(sel),
    addEventListener: (evt, fn) => { (listeners[evt] = listeners[evt] || []).push(fn); },
    fireDOMContentLoaded: () => { (listeners.DOMContentLoaded || []).forEach((fn) => fn()); },
  };

  return document;
}

module.exports = { createFakeDocument, FakeElement };
