import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/tour_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyTour() {
  console.log('Testing Interactive New User Tour and Welcome Modal...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });

  // 1. Visit with cleared localStorage to verify Welcome Modal
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_welcome_modal.png') });
  console.log('Saved 01_welcome_modal.png');

  // 2. Click "开启 1 分钟交互式向导"
  const startBtn = await page.$('.tour-welcome-modal button.bg-gradient-to-r');
  if (startBtn) {
    await startBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  } else {
    // Or click via evaluate
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('开启 1 分钟交互式向导')
      );
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));
  }

  // 3. Step 1: Brand Header spotlight
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_step1_brand.png') });
  console.log('Saved 02_step1_brand.png');

  // 4. Click Next -> Step 2
  const nextBtnSelector = '.ant-tour .ant-btn-primary';
  await page.click(nextBtnSelector);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_step2_platform_switcher.png') });
  console.log('Saved 03_step2_platform_switcher.png');

  // 5. Click Next -> Step 3
  await page.click(nextBtnSelector);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_step3_safety_bar.png') });
  console.log('Saved 04_step3_safety_bar.png');

  // 6. Advance to Step 8 (FBDPN Workbench with cross-platform transition)
  for (let i = 4; i <= 8; i++) {
    await page.click(nextBtnSelector);
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_step8_cvat_workbench.png') });
  console.log('Saved 05_step8_cvat_workbench.png');

  // 7. Test Top Bar "操作向导" Button
  const closeBtn = await page.$('.ant-tour .ant-tour-close');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Click Top Bar Guide Button
  await page.click('#tour-guide-btn');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_guide_dropdown_menu.png') });
  console.log('Saved 06_guide_dropdown_menu.png');

  await browser.close();
  console.log('Interactive Tour verification completed successfully!');
}

verifyTour().catch((err) => {
  console.error('Error during tour verification:', err);
  process.exit(1);
});
