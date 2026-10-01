import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Cockpit Screenshot
  console.log('Capturing Cockpit Preview...');
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  const cockpitPath = path.join(OUTPUT_DIR, 'cockpit_preview.png');
  await page.screenshot({ path: cockpitPath, fullPage: false });
  console.log(`Saved: ${cockpitPath}`);

  // 2. Review Workbench Screenshot
  console.log('Capturing Review Workbench Preview...');
  await page.goto('http://localhost:3001/?mode=analysis&tab=workbench', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  const workbenchPath = path.join(OUTPUT_DIR, 'review_workbench_preview.png');
  await page.screenshot({ path: workbenchPath, fullPage: false });
  console.log(`Saved: ${workbenchPath}`);

  // 3. Deliverables Report Screenshot
  console.log('Capturing Report Preview...');
  await page.goto('http://localhost:3001/?mode=analysis&tab=report', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  const reportPath = path.join(OUTPUT_DIR, 'report_preview.png');
  await page.screenshot({ path: reportPath, fullPage: false });
  console.log(`Saved: ${reportPath}`);

  await browser.close();
  console.log('All 3 core screenshots generated successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
