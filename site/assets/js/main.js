// Site-wide behaviour shared by every page.
// Module-specific demo/lab logic lives in assets/js/modules/module-N.js
// and is loaded only on that module's page.

document.addEventListener('DOMContentLoaded', () => {
  markCurrentNavLink();
});

// Marks the navigation link for the current page, including extensionless URLs.
function markCurrentNavLink() {
  const normalizePath = (pathname) => {
    const filename = pathname.split('/').filter(Boolean).pop() || 'index.html';
    return filename.replace(/\.html$/i, '') || 'index';
  };

  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll('.site-nav a').forEach((link) => {
    const linkPath = normalizePath(new URL(link.getAttribute('href'), window.location.href).pathname);

    if (linkPath === currentPath) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
