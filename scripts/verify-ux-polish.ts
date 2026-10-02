import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots/polish_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verifyPolish() {
  console.log('Launching browser to audit UX & visual polish...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // 1. Load Cockpit with 12 demo frames
  console.log('Navigating to Cockpit with preset demo frames...');
  await page.goto('http://localhost:3001/?mode=shore&tab=cockpit', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Click "✨ 装填全套示范数据 (12 帧)" button if present
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('装填全套示范数据')) {
      await btn.click();
      console.log('Loaded 12 demo frames.');
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_cockpit_baseline.png') });

  // 2. Test 6-DOF thruster button click (e.g. forward "↑ (W)")
  console.log('Triggering thruster movement with KeyW...');
  await page.keyboard.press('KeyW');
  await new Promise((r) => setTimeout(r, 350));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_cockpit_motion_active.png') });
  console.log('Captured Cockpit with active surge motion and thruster spike.');

  // 3. Switch to FBDPN by clicking header button
  console.log('Navigating to FBDPN via Header Switcher...');
  const headerBtns = await page.$$('header button, div button');
  for (const btn of headerBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('FBDPN 智能分析平台')) {
      await btn.click();
      console.log('Clicked FBDPN Platform Switcher.');
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));

  // If there's an "一键装填" button on screen, click it to ensure 12 frames
  const fillBtns = await page.$$('button');
  for (const btn of fillBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('装填') && text.includes('12')) {
      await btn.click();
      console.log('Clicked 12 frames fill button.');
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));

  // 3a. Overview Screenshot
  // Click "调查总览看板" tab
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('调查总览看板')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_fbdpn_overview_populated.png') });
  console.log('Captured 03_fbdpn_overview_populated.png');

  // 4. Switch to FBDPN Review Workbench (Standard mode)
  console.log('Navigating to FBDPN Review Workbench...');
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('检测与复核工作台')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_workbench_standard_populated.png') });
  console.log('Captured 04_workbench_standard_populated.png');

  // 5. Test Giant Canvas Mode in Review Workbench
  console.log('Activating Giant Canvas Mode...');
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('巨幕全景模式')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_workbench_giant_mode_populated.png') });
  console.log('Captured 05_workbench_giant_mode_populated.png');

  // 6. Switch to FBDPN Mission Images
  console.log('Navigating to FBDPN Mission Images...');
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('任务与影像库')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_fbdpn_images_grid.png') });
  console.log('Captured 06_fbdpn_images_grid.png');

  // 7. Switch to FBDPN Statistics
  console.log('Navigating to FBDPN Survey Statistics...');
  for (const btn of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('调查统计')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_fbdpn_statistics.png') });
  console.log('Captured 07_fbdpn_statistics.png');

  await browser.close();
  console.log('UX audit screenshots captured successfully in:', OUTPUT_DIR);
}

verifyPolish().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
