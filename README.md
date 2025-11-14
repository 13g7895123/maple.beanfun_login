# Beanfun 登入自動化工具

這是一個使用 Playwright 和 TypeScript 開發的 Beanfun 網站自動化登入工具，可以自動開啟瀏覽器並嘗試點擊登入按鈕。

## 功能特色

- 自動開啟 Chromium 瀏覽器
- 前往 Beanfun 遊戲專區
- 自動尋找並點擊登入按鈕
- 可視化操作過程（非無頭模式）
- 錯誤處理與截圖功能

## 系統需求

- Node.js 16.x 或更高版本
- npm 或 yarn 套件管理工具

## 安裝步驟

### 1. 安裝相依套件

在專案根目錄執行以下命令安裝所有必要的套件：

```bash
npm install
```

### 2. 安裝 Playwright 瀏覽器

Playwright 需要下載瀏覽器執行檔，執行以下命令進行安裝：

```bash
npx playwright install chromium
```

或者安裝所有瀏覽器：

```bash
npx playwright install
```

## 使用方式

### 啟動程式

在專案根目錄執行以下命令：

```bash
npm start
```

### 程式執行流程

1. **啟動瀏覽器**：程式會自動開啟 Chromium 瀏覽器視窗
2. **載入網頁**：前往 Beanfun 遊戲專區 (https://tw.beanfun.com/game_zone/)
3. **尋找登入按鈕**：自動搜尋頁面上包含「登入」或「登錄」文字的按鈕
4. **點擊登入**：若找到按鈕，會自動點擊
5. **截圖備份**：若未找到按鈕，會自動截圖保存至 `screenshot.png`
6. **關閉瀏覽器**：完成操作後自動關閉

## 專案結構

```
01_beanfun_login/
├── src/
│   └── beanfun-login.ts    # 主程式檔案
├── node_modules/            # 套件目錄
├── package.json             # 專案設定檔
├── package-lock.json        # 套件鎖定檔
├── tsconfig.json            # TypeScript 設定檔
└── README.md                # 說明文件
```

## 技術架構

### 使用的套件

- **Playwright** (^1.56.1)：瀏覽器自動化框架
- **TypeScript** (^5.9.3)：程式語言
- **ts-node** (^10.9.2)：直接執行 TypeScript 檔案
- **@types/node** (^24.10.0)：Node.js 型別定義

### TypeScript 設定

- 目標版本：ES2020
- 模組系統：CommonJS
- 嚴格模式：啟用
- 輸出目錄：./dist

## 程式碼說明

### 主要功能

#### 瀏覽器設定
```typescript
const browser = await chromium.launch({
  headless: false, // 顯示瀏覽器視窗
  slowMo: 500,     // 放慢操作速度
});
```

#### 網頁導航
```typescript
await page.goto('https://tw.beanfun.com/game_zone/', {
  waitUntil: 'networkidle', // 等待網路請求完成
});
```

#### 元素定位
```typescript
const loginButton = await page.locator('text=/登入|登錄/').first();
```

## 自訂設定

### 調整執行速度

修改 `src/beanfun-login.ts` 中的 `slowMo` 參數：

```typescript
slowMo: 500, // 單位：毫秒，數值越大操作越慢
```

### 切換無頭模式

若不需要看到瀏覽器視窗，可設定為無頭模式：

```typescript
headless: true, // 改為 true 即可背景執行
```

### 調整等待時間

修改 `waitForTimeout` 的數值（單位：毫秒）：

```typescript
await page.waitForTimeout(2000); // 等待 2 秒
```

## 故障排除

### 問題：無法找到登入按鈕

**原因**：網頁結構可能已更新，或載入時間不足

**解決方法**：
1. 檢查 `screenshot.png` 截圖檔案，確認頁面實際狀態
2. 增加 `waitForTimeout` 的等待時間
3. 使用瀏覽器開發者工具檢查登入按鈕的實際選擇器

### 問題：瀏覽器無法啟動

**原因**：Playwright 瀏覽器未正確安裝

**解決方法**：
```bash
npx playwright install chromium --force
```

### 問題：TypeScript 編譯錯誤

**原因**：套件未正確安裝或版本不相容

**解決方法**：
```bash
rm -rf node_modules package-lock.json
npm install
```

## 開發建議

### 新增登入邏輯

若需要實際完成登入流程，可在點擊登入按鈕後新增：

1. 等待登入表單出現
2. 填入帳號密碼
3. 送出表單
4. 等待登入完成

### 加入環境變數

建議使用 `dotenv` 套件管理敏感資訊：

```bash
npm install dotenv
```

建立 `.env` 檔案：
```
BEANFUN_ACCOUNT=your_account
BEANFUN_PASSWORD=your_password
```

## 注意事項

1. **帳號安全**：請勿在程式碼中直接寫入帳號密碼
2. **使用條款**：請遵守 Beanfun 網站的使用條款
3. **自動化限制**：部分網站可能會偵測自動化操作
4. **截圖檔案**：程式執行後可能會產生 `screenshot.png` 檔案

## 授權條款

ISC

## 版本歷史

- **1.0.0**：初始版本
  - 基本的瀏覽器啟動功能
  - 登入按鈕點擊功能
  - 截圖功能

## 聯絡資訊

如有問題或建議，請開啟 Issue 或提交 Pull Request。
