const fs = require('fs');
const vm = require('vm');
const { createFakeDocument, FakeElement } = require('./fakedom');

// Minimal in-memory localStorage, isolated per loadModuleScript() call
// (fresh vm context each time), matching the subset module-3.js uses.
function createFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

// Loads assets/js/modules/module-N.js for real (unmodified) inside a fake
// DOM, creates #demo-root / #lab-root containers, fires DOMContentLoaded,
// and returns the containers so a test can inspect what was built.
// `fetch`, if provided, is exposed as a global for code paths that call a
// real backend; omit it for tests that never take that path.
function loadModuleScript(scriptPath, { demo = true, lab = true, fetch: fetchImpl } = {}) {
  const document = createFakeDocument();

  let demoRoot = null;
  let labRoot = null;

  if (demo) {
    demoRoot = new FakeElement('div');
    demoRoot.id = 'demo-root';
    demoRoot.classList.add('widget-shell');
    document.body.appendChild(demoRoot);
  }

  if (lab) {
    labRoot = new FakeElement('div');
    labRoot.id = 'lab-root';
    labRoot.classList.add('widget-shell');
    document.body.appendChild(labRoot);
  }

  const context = vm.createContext({
    document,
    console,
    setInterval,
    clearInterval,
    setTimeout,
    clearTimeout,
    localStorage: createFakeLocalStorage(),
    ...(fetchImpl ? { fetch: fetchImpl } : {}),
  });

  const code = fs.readFileSync(scriptPath, 'utf8');
  vm.runInContext(code, context, { filename: scriptPath });
  document.fireDOMContentLoaded();

  return { document, demoRoot, labRoot, context };
}

module.exports = { loadModuleScript };

