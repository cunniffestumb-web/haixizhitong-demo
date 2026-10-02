import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/relocation_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyRelocation() {
  console.log('Testing relocated demo/reset button in Cockpit L0 safety bar and clean Header...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Test 1: Cockpit with 0 frames (showing 装填全套示范数据)
  await page.setViewport({ width: 1536, height: 864, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({ path: path.join(OUTPUT_DIR, 'cockpit_full_1536.png') });
  console.log('Saved cockpit_full_1536.png');

  // Capture Header specifically
  const header = await page.$('header');
  if (header) {
    await header.screenshot({ path: path.join(OUTPUT_DIR, 'header_clean_1536.png') });
    console.log('Saved header_clean_1536.png');
  }

  // Capture L0 Safety bar specifically
  const l0Bar = await page.$('.h-\\[36px\\]');
  if (l0Bar) {
    await l0Bar.screenshot({ path: path.join(OUTPUT_DIR, 'l0_safety_bar.png') });
    console.log('Saved l0_safety_bar.png');
  }

  // Test 2: Check 1366 width
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 400));
  if (header) {
    await header.screenshot({ path: path.join(OUTPUT_DIR, 'header_clean_1366.png') });
    console.log('Saved header_clean_1366.png');
  }
  const l0Bar1366 = await page.$('.h-\\[36px\\]');
  if (l0Bar1366) {
    await l0Bar1366.screenshot({ path: path.join(OUTPUT_DIR, 'l0_safety_bar_1366.png') });
    console.log('Saved l0_safety_bar_1366.png');
  }

  await browser.close();
  console.log('Verification completed successfully!');
}

verifyRelocation().catch((err) => {
  console.error('Error during relocation audit:', err);
  process.exit(1);
});
