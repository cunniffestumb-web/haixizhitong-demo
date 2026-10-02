import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/redesign_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyRedesign() {
  console.log('Launching Chrome to verify nautical chart and header...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Check Task Center nautical chart on 1536x864
  await page.setViewport({ width: 1536, height: 864, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3001/?mode=shore&tab=task_center', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({ path: path.join(OUTPUT_DIR, 'task_center_full.png') });
  console.log('Saved task_center_full.png');

  // Also capture the map specifically
  const mapElement = await page.$('.cockpit-panel');
  if (mapElement) {
    await mapElement.screenshot({ path: path.join(OUTPUT_DIR, 'task_center_map.png') });
    console.log('Saved task_center_map.png');
  }

  // 2. Check Header on 1366x768
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  const header1366 = await page.$('header');
  if (header1366) {
    await header1366.screenshot({ path: path.join(OUTPUT_DIR, 'header_1366.png') });
    console.log('Saved header_1366.png');
  }

  // 3. Check Header on 1536x864
  await page.setViewport({ width: 1536, height: 864, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 400));
  const header1536 = await page.$('header');
  if (header1536) {
    await header1536.screenshot({ path: path.join(OUTPUT_DIR, 'header_1536.png') });
    console.log('Saved header_1536.png');
  }

  await browser.close();
  console.log('Verification completed successfully!');
}

verifyRedesign().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
