import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/hover_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyHover() {
  console.log('Testing hover magnification and adjacent yielding...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 864, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3001/?mode=shore&tab=devices', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Initial State Screenshot
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'device_page_resting.png') });
  console.log('Saved device_page_resting.png');

  // 2. Hover over Card 1 (First self check card)
  const cards = await page.$$('.space-y-3 > div > div');
  if (cards.length > 0) {
    console.log(`Found ${cards.length} cards. Hovering Card 1...`);
    await cards[0].hover();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'device_card1_hovered.png') });
    console.log('Saved device_card1_hovered.png');

    // 3. Hover over Card 4
    if (cards.length > 3) {
      console.log('Hovering Card 4...');
      await cards[3].hover();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'device_card4_hovered.png') });
      console.log('Saved device_card4_hovered.png');
    }
  }

  await browser.close();
  console.log('Hover verification completed successfully!');
}

verifyHover().catch((err) => {
  console.error('Error in hover audit:', err);
  process.exit(1);
});
