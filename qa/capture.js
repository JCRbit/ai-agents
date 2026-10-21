const { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');

const BASE = 'http://localhost:8000';
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};
const PAGES = ['index.html', 'modules/modulo-1.html', 'modules/modulo-3.html', 'modules/modulo-4.html'];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });

  const consoleIssues = [];

  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleIssues.push(`[${vpName}] console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => consoleIssues.push(`[${vpName}] pageerror: ${err.message}`));

    for (const p of PAGES) {
      await page.goto(`${BASE}/${p}`, { waitUntil: 'networkidle' });
      const slug = p.replace(/\//g, '_').replace('.html', '');
      await page.screenshot({ path: `/tmp/qa-${vpName}-${slug}.png`, fullPage: true });

      // Check for horizontal overflow (the #1 responsive bug)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) consoleIssues.push(`[${vpName}] HORIZONTAL OVERFLOW on ${p}`);
    }
    await context.close();
  }

  await browser.close();

  console.log('--- Console/page errors across all viewports ---');
  if (consoleIssues.length === 0) console.log('(none)');
  else consoleIssues.forEach((i) => console.log(i));
})();
