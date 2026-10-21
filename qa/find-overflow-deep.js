const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');

const url = process.argv[2] || 'http://localhost:8000/modules/modulo-1.html';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const report = await page.evaluate(() => {
    const out = [];
    function walk(el, depth) {
      if (el.nodeType === 1 && el.scrollWidth > el.clientWidth + 1) {
        out.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 60),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          depth,
        });
      }
      for (const child of el.children) walk(child, depth + 1);
    }
    walk(document.body, 0);
    return out;
  });

  report.forEach((r) => {
    console.log('  '.repeat(r.depth) + r.tag + '.' + r.cls + ' -> scrollWidth=' + r.scrollWidth + ' clientWidth=' + r.clientWidth);
  });

  await browser.close();
})();
