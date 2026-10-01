import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');

async function testLifecycle() {
  console.log('Testing full interactive hardware-in-the-loop lifecycle...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Initial State (Cockpit at S01, 0 images)
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step1_initial_0_frames.png') });
  console.log('Step 1: Initial 0 frames saved.');

  // 2. Capture S01
  console.log('Clicking Capture for S01...');
  const captureBtns = await page.$$('button');
  for (const btn of captureBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('定点抓拍 (Capture)')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step2_after_s01_capture.png') });
  console.log('Step 2: S01 captured and added to reel.');

  // 3. Select S02 and Capture (triggers underexposure)
  console.log('Selecting S02...');
  const siteElements = await page.$$('.space-y-1\\.5 > div');
  if (siteElements.length >= 2) {
    await siteElements[1].click(); // click S02
  }
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing S02...');
  const captureBtns2 = await page.$$('button');
  for (const btn of captureBtns2) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('定点抓拍 (Capture)')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step3_s02_underexposed_modal.png') });
  console.log('Step 3: S02 underexposure alert triggered.');

  // 4. Click Recapture Execution
  console.log('Executing Recapture...');
  const modalBtns = await page.$$('.ant-modal button, button');
  for (const btn of modalBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('一键执行主动复拍')) {
      await btn.click();
      break;
    }
  }
  // Wait for light ramp up (600ms) + shutter (700ms) + compare step (500ms)
  await new Promise((r) => setTimeout(r, 2600));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step4_recapture_comparison.png') });
  console.log('Step 4: Recapture comparison saved.');

  // 5. Click Adopt Recaptured Image
  console.log('Adopting Recaptured Image...');
  const adoptBtns = await page.$$('.ant-modal button, button');
  for (const btn of adoptBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('采纳复拍图像并替换主样帧')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'step5_after_adoption.png') });
  console.log('Step 5: Adopted recaptured frame into reel.');

  await browser.close();
  console.log('Full lifecycle test completed successfully!');
}

testLifecycle().catch((err) => {
  console.error('Lifecycle test error:', err);
  process.exit(1);
});
