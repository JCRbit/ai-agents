const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');

const url = process.argv[2] || 'http://localhost:8000/modules/modulo-1.html';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url, { waitUntil: 'networkidle' });

  const culprits = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 1) {
        out.push({
          tag: el.tagName,
          cls: el.className && el.className.toString ? el.className.toString().slice(0, 60) : '',
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          text: (el.textContent || '').trim().slice(0, 50),
        });
      }
    });
    return out.slice(0, 15);
  });

  console.log(`docWidth=375, elements overflowing to the right:`);
  culprits.forEach((c) => console.log(c));

  await browser.close();
})();
