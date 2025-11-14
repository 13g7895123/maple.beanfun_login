# Beanfun 登入自動化工具

這是一個使用 Playwright 和 TypeScript 開發的 Beanfun 網站自動化登入工具，整合 AutoHotkey API 實現完整的登入流程自動化，包含帳號密碼輸入、登入確認、遊戲角色選擇等功能。

## 功能特色

- 自動開啟 Chrome 瀏覽器
- 前往 Beanfun 遊戲專區並自動登入
- 自動處理 iframe 登入表單
- 自動填入帳號密碼
- 整合 AutoHotkey API 處理特殊鍵盤操作
- 自動選擇遊戲角色並啟動
- 可視化操作過程（非無頭模式）
- 錯誤處理與截圖功能
- 健康檢查確保 API 連線正常

## 系統需求

- Node.js 16.x 或更高版本
- npm 或 yarn 套件管理工具
- Google Chrome 瀏覽器
- AutoHotkey v2（用於鍵盤操作）
- Python 3.8+ 與 uv 套件管理工具（用於 AutoHotkey API Server）

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

### 3. 安裝 Google Chrome

確保系統已安裝 Google Chrome 瀏覽器，程式預設路徑為：
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### 4. 安裝 AutoHotkey v2

1. 下載並安裝 AutoHotkey v2：https://www.autohotkey.com/
2. 記下安裝路徑，稍後需要在 `auto-hotkey/ahk_api.py` 中設定

### 5. 設定 AutoHotkey API Server

進入 `auto-hotkey` 目錄並安裝 Python 依賴：

```bash
cd auto-hotkey
uv sync
```

如果尚未安裝 uv，請先安裝：

```bash
pip install uv
```

## 使用方式

### 前置作業：設定帳號密碼

在使用前，請先修改 `src/beanfun-login.ts` 中的帳號密碼：

```typescript
await accountInput.fill('YOUR_ACCOUNT');  // 第 68 行
await passwordInput.fill('YOUR_PASSWORD'); // 第 79 行
```

並修改角色名稱（如果需要）：

```typescript
await page.getByText('YOUR_CHARACTER_NAME').click();  // 第 110 行
```

### 啟動程式

**步驟 1：啟動 AutoHotkey API Server**

在專案根目錄開啟第一個終端機視窗，執行：

```bash
cd auto-hotkey
uv run ahk_api.py
```

看到以下訊息表示啟動成功：
```
AutoHotkey API Server 啟動中...
可用端點:
  POST http://localhost:5000/press_enter - 按下 Enter 鍵
  GET  http://localhost:5000/health - 健康檢查
```

**步驟 2：執行登入程式**

保持 API Server 運行，開啟第二個終端機視窗，在專案根目錄執行：

```bash
npm start
```

### 程式執行流程

1. **健康檢查**：檢查 AutoHotkey API Server 是否正常運行
2. **啟動瀏覽器**：自動開啟 Chrome 瀏覽器視窗
3. **載入網頁**：前往 Beanfun 遊戲專區 (https://tw.beanfun.com/game_zone/)
4. **點擊登入按鈕**：自動搜尋並點擊登入按鈕
5. **處理登入表單**：
   - 等待 iframe 載入
   - 定位到第 4 個 iframe（登入表單）
   - 自動填入帳號
   - 自動填入密碼
   - 點擊登入按鈕
6. **關閉彈出視窗**：點擊 Exit 連結
7. **選擇角色**：
   - 點擊「快速啟動」
   - 選擇指定角色
8. **啟動遊戲**：透過 AutoHotkey API 按下左鍵和 Enter 鍵
9. **完成任務**：保持瀏覽器開啟 5 秒後自動關閉

## 專案結構

```
maple.beanfun_login/
├── src/
│   └── beanfun-login.ts      # 主程式檔案
├── auto-hotkey/              # AutoHotkey 整合模組
│   ├── ahk_api.py            # Flask API Server
│   ├── press_enter.ahk       # AutoHotkey v2 腳本
│   ├── pyproject.toml        # Python 專案設定
│   ├── uv.lock               # Python 依賴鎖定檔
│   └── README.md             # AutoHotkey 模組說明
├── node_modules/             # Node.js 套件目錄
├── package.json              # Node.js 專案設定檔
├── package-lock.json         # Node.js 套件鎖定檔
├── tsconfig.json             # TypeScript 設定檔
└── README.md                 # 專案說明文件
```

## 技術架構

### 主要技術棧

**前端自動化（TypeScript）**
- **Playwright** (^1.56.1)：瀏覽器自動化框架
- **TypeScript** (^5.9.3)：程式語言
- **ts-node** (^10.9.2)：直接執行 TypeScript 檔案
- **@types/node** (^24.10.0)：Node.js 型別定義

**鍵盤操作服務（Python + AutoHotkey）**
- **Flask**：輕量級 HTTP API 框架
- **AutoHotkey v2**：Windows 鍵盤自動化工具
- **uv**：現代化 Python 套件管理工具

### TypeScript 設定

- 目標版本：ES2020
- 模組系統：CommonJS
- 嚴格模式：啟用
- 輸出目錄：./dist

### 架構說明

本專案採用微服務架構，將鍵盤操作獨立為 HTTP API 服務：

1. **Playwright 主程式**：負責瀏覽器控制、網頁導航、表單填寫
2. **AutoHotkey API Server**：提供 RESTful API，接收請求後執行鍵盤操作
3. **HTTP 通訊**：兩個服務透過 HTTP 協定溝通，降低耦合度

## 程式碼說明

### 主要功能

#### 1. 健康檢查
```typescript
const healthResponse = await fetch('http://localhost:5000/health');
const healthResult = await healthResponse.json();
if (healthResult.status !== 'ok') {
  throw new Error('AutoHotkey API 狀態異常');
}
```

#### 2. 瀏覽器設定
```typescript
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: false, // 顯示瀏覽器視窗
  slowMo: 500,     // 放慢操作速度
  args: ['--disable-features=ExternalProtocolDialog']
});
```

#### 3. 網頁導航
```typescript
await page.goto('https://tw.beanfun.com/game_zone/', {
  waitUntil: 'networkidle', // 等待網路請求完成
});
```

#### 4. iframe 處理
```typescript
// 取得第 4 個 iframe 的 contentFrame
const loginFrame = page.frameLocator('iframe').nth(3);

// 在 iframe 中操作元素
const accountInput = loginFrame.getByRole('textbox', { name: '帳號或認證Email：' });
await accountInput.fill('your_account');
```

#### 5. 元素定位
```typescript
// 使用正則表達式匹配文字
const loginButton = await page.locator('text=/登入|登錄/').first();

// 使用 Role-based 選擇器
const submitButton = loginFrame.getByRole('button', { name: '登入' });
```

#### 6. 呼叫 AutoHotkey API
```typescript
const response = await fetch('http://localhost:5000/press_enter', { 
  method: 'POST' 
});
const result = await response.json();
```

## 自訂設定

### 修改 Chrome 路徑

如果 Chrome 安裝在不同位置，請修改 `src/beanfun-login.ts` 第 21 行：

```typescript
executablePath: 'YOUR_CHROME_PATH', // 改為實際的 Chrome 路徑
```

### 修改 AutoHotkey 路徑

如果 AutoHotkey v2 安裝在不同位置，請修改 `auto-hotkey/ahk_api.py` 第 13 行：

```python
AHK_EXE = r"YOUR_AUTOHOTKEY_PATH"  # 改為實際的 AutoHotkey.exe 路徑
```

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

### 修改 API Server 連接埠

如果需要更改 API Server 的連接埠，請同時修改：

1. `auto-hotkey/ahk_api.py` 最後一行：
```python
app.run(host='0.0.0.0', port=YOUR_PORT, debug=True)
```

2. `src/beanfun-login.ts` 中所有 `http://localhost:5000` 改為新的連接埠

## 故障排除

### 問題：AutoHotkey API 未啟動或無法連線

**錯誤訊息**：`AutoHotkey API 未啟動或無法連線，請先執行: uv run ahk_api.py`

**原因**：AutoHotkey API Server 尚未啟動或連接埠被佔用

**解決方法**：
1. 確認已在另一個終端機視窗執行 `cd auto-hotkey && uv run ahk_api.py`
2. 確認沒有其他程式佔用 5000 連接埠
3. 檢查防火牆是否阻擋連線

### 問題：無法找到登入按鈕

**原因**：網頁結構可能已更新，或載入時間不足

**解決方法**：
1. 檢查 `screenshot.png` 截圖檔案，確認頁面實際狀態
2. 增加 `waitForTimeout` 的等待時間
3. 使用瀏覽器開發者工具檢查登入按鈕的實際選擇器

### 問題：找不到 Chrome 瀏覽器

**錯誤訊息**：瀏覽器啟動失敗

**原因**：Chrome 未安裝或路徑不正確

**解決方法**：
1. 確認已安裝 Google Chrome
2. 檢查並修改 `src/beanfun-login.ts` 中的 `executablePath`

### 問題：AutoHotkey 腳本執行失敗

**錯誤訊息**：API 返回錯誤狀態

**原因**：AutoHotkey v2 未正確安裝或路徑設定錯誤

**解決方法**：
1. 確認已安裝 AutoHotkey v2（非 v1）
2. 檢查並修改 `auto-hotkey/ahk_api.py` 中的 `AHK_EXE` 路徑
3. 手動執行 AutoHotkey 測試是否正常

### 問題：無法找到 iframe 或表單元素

**原因**：網頁結構改變或載入時間不足

**解決方法**：
1. 增加等待時間：`await page.waitForTimeout(3000)`
2. 使用瀏覽器開發者工具確認 iframe 索引
3. 調整 iframe 選擇器：`.nth(N)` 中的 N 值

### 問題：TypeScript 編譯錯誤

**原因**：套件未正確安裝或版本不相容

**解決方法**：
```bash
rm -rf node_modules package-lock.json
npm install
```

### 問題：Python 依賴安裝失敗

**原因**：uv 未安裝或版本過舊

**解決方法**：
```bash
pip install --upgrade uv
cd auto-hotkey
uv sync
```

## 開發建議

### 使用環境變數管理敏感資訊

建議使用 `dotenv` 套件管理帳號密碼等敏感資訊：

1. 安裝 dotenv：
```bash
npm install dotenv
```

2. 建立 `.env` 檔案（記得加入 .gitignore）：
```
BEANFUN_ACCOUNT=your_account
BEANFUN_PASSWORD=your_password
CHARACTER_NAME=your_character_name
```

3. 在程式中使用：
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

await accountInput.fill(process.env.BEANFUN_ACCOUNT || '');
await passwordInput.fill(process.env.BEANFUN_PASSWORD || '');
```

### 擴充 AutoHotkey API

可以在 `auto-hotkey/ahk_api.py` 中新增更多端點，例如：

```python
@app.route('/press_key/<key>', methods=['POST'])
def press_key(key):
    """按下任意鍵"""
    script = f'Send "{{{key}}}"'
    subprocess.run([AHK_EXE, '*'], input=script.encode('utf-8'), check=True)
    return jsonify({"status": "success"}), 200
```

### 新增錯誤重試機制

建議加入重試邏輯處理網路不穩定的情況：

```typescript
async function retryOperation(operation: () => Promise<void>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await operation();
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}
```

## 注意事項

1. **帳號安全**：
   - 請勿在程式碼中直接寫入帳號密碼
   - 建議使用環境變數或設定檔管理敏感資訊
   - 將 `.env` 檔案加入 `.gitignore` 避免意外提交

2. **使用條款**：
   - 請遵守 Beanfun 網站的使用條款
   - 本工具僅供學習與個人使用
   - 請勿用於商業用途或違反服務條款的行為

3. **自動化限制**：
   - 部分網站可能會偵測自動化操作
   - 可能需要定期更新選擇器以適應網頁改版
   - 建議適當調整操作速度避免觸發防護機制

4. **系統需求**：
   - 本工具目前僅支援 Windows 系統（因為使用 AutoHotkey）
   - 需要保持 AutoHotkey API Server 持續運行
   - 確保系統有足夠權限執行鍵盤操作

5. **檔案管理**：
   - 程式執行後可能會產生 `screenshot.png` 檔案
   - 建議定期清理不需要的截圖檔案

## 授權條款

ISC

## 版本歷史

- **2.0.0**：整合 AutoHotkey API
  - 新增 AutoHotkey API Server
  - 完整登入流程自動化
  - iframe 表單處理
  - 自動填入帳號密碼
  - 角色選擇功能
  - 健康檢查機制

- **1.0.0**：初始版本
  - 基本的瀏覽器啟動功能
  - 登入按鈕點擊功能
  - 截圖功能

## 聯絡資訊

如有問題或建議，請開啟 Issue 或提交 Pull Request。
