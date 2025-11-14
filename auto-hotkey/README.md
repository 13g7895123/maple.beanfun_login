# AutoHotkey API Server

提供 HTTP API 來觸發 AutoHotkey 按鍵操作。

## 安裝步驟

1. **安裝 AutoHotkey**
   - 下載並安裝：https://www.autohotkey.com/
   - 預設安裝路徑：`C:\Program Files\AutoHotkey\AutoHotkey.exe`

2. **安裝 Python 依賴（使用 uv）**
   ```bash
   uv sync
   ```

## 使用方式

### 方法 1：使用 Python API Server（推薦）

1. **啟動 API Server**
   ```bash
   uv run ahk_api.py
   ```

2. **在 Playwright 中呼叫 API**
   ```typescript
   // 在需要按 Enter 的地方呼叫
   await fetch('http://localhost:5000/press_enter', { method: 'POST' });
   ```

### 方法 2：直接使用 AutoHotkey 腳本

1. **執行 AHK 腳本**
   ```bash
   press_enter.ahk
   ```

2. **使用快捷鍵**
   - 按下 `Ctrl+Alt+E` 會觸發 Enter 鍵

## API 端點

### POST /press_enter
按下 Enter 鍵

**請求範例：**
```bash
curl -X POST http://localhost:5000/press_enter
```

**回應範例：**
```json
{
  "status": "success",
  "message": "Enter key pressed"
}
```

### GET /health
健康檢查

**請求範例：**
```bash
curl http://localhost:5000/health
```

**回應範例：**
```json
{
  "status": "ok"
}
```

## 在 Playwright 中整合

在 `src/beanfun-login.ts` 中，將按 Enter 的部分替換為：

```typescript
// 呼叫 AutoHotkey API 按下 Enter
console.log('透過 AutoHotkey API 按下 Enter 鍵...');
await fetch('http://localhost:5000/press_enter', { method: 'POST' });
await page.waitForTimeout(500);
```

## 注意事項

- API Server 預設監聽 `0.0.0.0:5000`
- 確保 AutoHotkey 已正確安裝
- 如果 AutoHotkey 安裝路徑不同，請修改 `ahk_api.py` 中的 `AHK_EXE` 變數
