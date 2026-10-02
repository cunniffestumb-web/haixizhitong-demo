import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/header_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function auditHeader() {
  console.log('Testing header line wrapping across viewports...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test sizes
  const viewports = [
    { name: '1920_full_hd', width: 1920, height: 1080 },
    { name: '1536_laptop_125pct', width: 1536, height: 864 },
    { name: '1440_laptop', width: 1440, height: 900 },
    { name: '1366_small_laptop', width: 1366, height: 768 },
  ];

  for (const vp of viewports) {
    console.log(`Setting viewport ${vp.name}: ${vp.width}x${vp.height}...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Capture header element specifically
    const header = await page.$('header');
    if (header) {
      const headerPath = path.join(OUTPUT_DIR, `header_${vp.name}.png`);
      await header.screenshot({ path: headerPath });
      console.log(`Saved header screenshot: ${headerPath}`);
    }
  }

  await browser.close();
  console.log('Header audit screenshots generated successfully!');
}

auditHeader().catch((err) => {
  console.error('Error during header audit:', err);
  process.exit(1);
});
