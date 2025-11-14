import { chromium } from 'playwright';

async function loginBeanfun() {
  // 啟動瀏覽器
  const browser = await chromium.launch({
    headless: false, // 設為 false 可以看到瀏覽器操作
    slowMo: 500, // 放慢操作速度，方便觀察
  });

  try {
    // 建立新的瀏覽器上下文和頁面
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('正在前往 Beanfun 遊戲專區...');

    // 訪問網站
    await page.goto('https://tw.beanfun.com/game_zone/', {
      waitUntil: 'networkidle', // 等待網路閒置
    });

    console.log('網頁載入完成，尋找登入按鈕...');

    // 等待頁面完全載入
    await page.waitForTimeout(2000);

    // 嘗試找到登入按鈕並點擊
    // 通常登入按鈕可能有這些特徵：文字包含「登入」、「登錄」或特定的 class/id
    const loginButton = await page.locator('text=/登入|登錄/').first();

    if (await loginButton.isVisible()) {
      console.log('找到登入按鈕，準備點擊...');
      await loginButton.click();
      console.log('已點擊登入按鈕');

      // 等待一段時間以觀察結果
      await page.waitForTimeout(3000);
    } else {
      console.log('未找到登入按鈕，嘗試其他方式...');

      // 如果找不到，可以嘗試截圖來檢查頁面狀態
      await page.screenshot({ path: 'screenshot.png', fullPage: true });
      console.log('已儲存截圖至 screenshot.png');
    }

    // 保持瀏覽器開啟以便觀察
    console.log('任務完成，請檢查瀏覽器視窗');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('發生錯誤:', error);
  } finally {
    // 關閉瀏覽器
    await browser.close();
    console.log('瀏覽器已關閉');
  }
}

// 執行函數
loginBeanfun().catch(console.error);
