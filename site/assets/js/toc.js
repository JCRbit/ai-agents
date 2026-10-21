// Populate the statically reserved "En esta página" sidebar.
// The page grid and content wrapper are present in HTML before first paint,
// so this script does not move DOM nodes or trigger a late layout reflow.
(() => {
  const page = document.querySelector('main > .page.has-toc');
  if (!page) return;

  const nav = page.querySelector(':scope > .page-toc');
  const list = nav?.querySelector('.page-toc__list');
  if (!nav || !list) return;

  const headings = Array.from(page.querySelectorAll('.page-content h2[id], .page-content h3[id]'));
  if (headings.length === 0) {
    nav.hidden = true;
    return;
  }

  const linkByHeadingId = new Map();
  const fragment = document.createDocumentFragment();
  headings.forEach((heading) => {
    const li = document.createElement('li');
    li.className = heading.tagName === 'H3'
      ? 'page-toc__item page-toc__item--sub'
      : 'page-toc__item';
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    li.appendChild(link);
    fragment.appendChild(li);
    linkByHeadingId.set(heading.id, link);
  });
  list.replaceChildren(fragment);
  observeActiveSection(headings, linkByHeadingId);
})();

function observeActiveSection(headings, linkByHeadingId) {
  const THRESHOLD = 100;
  function updateActive() {
    let currentId = null;
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= THRESHOLD) currentId = heading.id;
      else break;
    }
    linkByHeadingId.forEach((link, id) => {
      link.classList.toggle('is-active', id === currentId);
    });
  }
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActive();
      ticking = false;
    });
  }, { passive: true });
  updateActive();
}
