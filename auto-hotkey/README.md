# AutoHotkey API Server

提供 HTTP API 來觸發 AutoHotkey v2 按鍵操作，用於在 Playwright 自動化中執行系統層級的鍵盤操作。

## 功能特色

- 提供 RESTful API 介面
- 支援複合按鍵操作（左鍵 + Enter）
- 健康檢查端點
- 可擴充的按鍵操作
- 基於 Flask 輕量化設計

## 系統需求

- Windows 作業系統
- Python 3.8 或更高版本
- AutoHotkey v2（注意：不支援 v1）
- uv 套件管理工具

## 安裝步驟

1. **安裝 AutoHotkey v2**
   - 下載並安裝：https://www.autohotkey.com/
   - **重要**：必須安裝 v2 版本，v1 語法不相容
   - 記下安裝路徑，稍後需要設定

2. **安裝 uv（如果尚未安裝）**
   ```bash
   pip install uv
   ```

3. **安裝 Python 依賴**
   ```bash
   cd auto-hotkey
   uv sync
   ```

4. **設定 AutoHotkey 路徑**
   
   編輯 `ahk_api.py` 第 13 行，修改為你的 AutoHotkey v2 安裝路徑：
   
   ```python
   AHK_EXE = r"YOUR_AUTOHOTKEY_V2_PATH\AutoHotkey.exe"
   ```
   
   常見路徑：
   - `C:\Program Files\AutoHotkey\v2\AutoHotkey.exe`
   - `D:\Program Files\AutoHotkey\v2\AutoHotkey.exe`

## 使用方式

### 方法 1：使用 Python API Server（推薦）

這是整合到主專案的標準方式。

1. **啟動 API Server**
   
   在 `auto-hotkey` 目錄下執行：
   ```bash
   uv run ahk_api.py
   ```
   
   成功啟動會看到：
   ```
   AutoHotkey API Server 啟動中...
   可用端點:
     POST http://localhost:5000/press_enter - 按下 Enter 鍵
     GET  http://localhost:5000/health - 健康檢查
    * Running on all addresses (0.0.0.0)
    * Running on http://127.0.0.1:5000
   ```

2. **在 Playwright 中呼叫 API**
   
   ```typescript
   // 健康檢查
   const healthResponse = await fetch('http://localhost:5000/health');
   const healthResult = await healthResponse.json();
   
   // 執行按鍵操作
   const response = await fetch('http://localhost:5000/press_enter', { 
     method: 'POST' 
   });
   const result = await response.json();
   console.log(result); // { "status": "success", "message": "..." }
   ```

3. **保持 Server 運行**
   
   在使用主程式期間，請保持 API Server 持續運行。

### 方法 2：直接使用 AutoHotkey 腳本（測試用）

適合用於測試或獨立使用。

1. **執行 AHK 腳本**
   
   雙擊執行 `press_enter.ahk`

2. **使用快捷鍵**
   
   - 按下 `Ctrl+Alt+E` 會觸發 Enter 鍵
   - 腳本會在系統托盤顯示圖示

## API 端點

### POST /press_enter

執行複合按鍵操作：按下左方向鍵，等待 0.5 秒，然後按下 Enter 鍵。

**請求範例：**
```bash
curl -X POST http://localhost:5000/press_enter
```

**回應範例：**
```json
{
  "status": "success",
  "message": "Left arrow, then Enter pressed"
}
```

**錯誤回應：**
```json
{
  "status": "error",
  "message": "error details..."
}
```

**執行流程：**
1. 按下左方向鍵（{Left}）
2. 暫停 500 毫秒
3. 按下 Enter 鍵（{Enter}）

### GET /health

健康檢查端點，用於確認 API Server 是否正常運行。

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

**狀態碼：**
- 200：服務正常
- 500：服務異常

## 在 Playwright 中整合

### 完整範例

```typescript
import { chromium } from 'playwright';

async function main() {
  // 1. 先檢查 API Server 是否運行
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthResult = await healthResponse.json();
    if (healthResult.status !== 'ok') {
      throw new Error('API Server 狀態異常');
    }
  } catch (error) {
    console.error('AutoHotkey API 未啟動，請執行: uv run ahk_api.py');
    return;
  }

  // 2. 執行瀏覽器自動化
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // ... 你的自動化邏輯 ...
  
  // 3. 需要按鍵時呼叫 API
  console.log('透過 AutoHotkey API 執行按鍵操作...');
  try {
    const response = await fetch('http://localhost:5000/press_enter', { 
      method: 'POST' 
    });
    const result = await response.json();
    console.log('按鍵操作結果:', result);
  } catch (error) {
    console.error('呼叫 API 失敗:', error);
  }
  
  await page.waitForTimeout(500); // 等待按鍵生效
  
  await browser.close();
}
```

### 錯誤處理建議

```typescript
async function pressEnterViaAPI() {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:5000/press_enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('按鍵操作成功:', result.message);
      return true;
    } catch (error) {
      console.error(`嘗試 ${i + 1}/${maxRetries} 失敗:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  return false;
}
```

## 技術細節

### AutoHotkey v2 腳本語法

API Server 執行的 AutoHotkey v2 腳本：

```autohotkey
Send "{Left}"     ; 按下左方向鍵
Sleep 500         ; 暫停 500 毫秒
Send "{Enter}"    ; 按下 Enter 鍵
```

### Flask 路由設計

```python
@app.route('/press_enter', methods=['POST'])
def press_enter():
    script = '''Send "{Left}"
Sleep 500
Send "{Enter}"'''
    subprocess.run([AHK_EXE, '*'], input=script.encode('utf-8'), check=True)
    return jsonify({"status": "success", "message": "Left arrow, then Enter pressed"}), 200
```

### 為什麼使用 API 架構？

1. **跨語言整合**：Python 與 TypeScript 透過 HTTP 通訊
2. **解耦合設計**：鍵盤操作邏輯獨立於瀏覽器自動化
3. **易於擴充**：可輕鬆新增更多按鍵端點
4. **除錯友善**：可獨立測試鍵盤操作功能
5. **跨平台潛力**：未來可替換為其他平台的實作

## 擴充指南

### 新增自訂按鍵端點

編輯 `ahk_api.py`，新增路由：

```python
@app.route('/press_key/<key_name>', methods=['POST'])
def press_custom_key(key_name):
    """按下自訂按鍵"""
    # 驗證按鍵名稱
    valid_keys = ['up', 'down', 'left', 'right', 'enter', 'esc', 'tab']
    if key_name.lower() not in valid_keys:
        return jsonify({"status": "error", "message": "Invalid key"}), 400
    
    script = f'Send "{{{key_name.capitalize()}}}"'
    try:
        subprocess.run([AHK_EXE, '*'], input=script.encode('utf-8'), check=True)
        return jsonify({"status": "success", "message": f"{key_name} pressed"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
```

使用方式：
```typescript
await fetch('http://localhost:5000/press_key/up', { method: 'POST' });
await fetch('http://localhost:5000/press_key/esc', { method: 'POST' });
```

### 新增組合鍵支援

```python
@app.route('/press_combo', methods=['POST'])
def press_combo():
    """按下 Ctrl+C"""
    script = 'Send "^c"'  ; Ctrl+C
    subprocess.run([AHK_EXE, '*'], input=script.encode('utf-8'), check=True)
    return jsonify({"status": "success"}), 200
```

AutoHotkey v2 修飾鍵符號：
- `^` = Ctrl
- `!` = Alt
- `+` = Shift
- `#` = Win

## 故障排除

### 問題：API Server 啟動失敗

**錯誤訊息：**`Address already in use`

**原因：**連接埠 5000 已被佔用

**解決方法：**
1. 更改 `ahk_api.py` 最後一行的 `port=5000` 為其他連接埠
2. 記得同步修改 Playwright 程式中的 URL

### 問題：AutoHotkey 腳本執行失敗

**錯誤訊息：**`FileNotFoundError` 或路徑錯誤

**原因：**AutoHotkey v2 路徑設定錯誤

**解決方法：**
1. 確認已安裝 AutoHotkey v2（不是 v1）
2. 找到正確的 `AutoHotkey.exe` 路徑
3. 更新 `ahk_api.py` 中的 `AHK_EXE` 變數
4. 路徑使用原始字串：`r"C:\Your\Path\AutoHotkey.exe"`

### 問題：按鍵沒有效果

**原因：**目標視窗未獲得焦點

**解決方法：**
1. 確保要操作的視窗在最上層
2. 在按鍵前加入等待時間
3. 使用 AutoHotkey 的視窗激活命令

### 問題：uv sync 失敗

**錯誤訊息：**套件安裝錯誤

**解決方法：**
```bash
# 更新 uv
pip install --upgrade uv

# 清除快取
uv cache clean

# 重新同步
uv sync
```

## 安全性考量

### 本地監聽

API Server 監聽 `0.0.0.0:5000`，這意味著：
- 本機所有網路介面都可存取
- 區域網路內的其他裝置也可能存取

**生產環境建議：**
```python
# 僅監聽本機
app.run(host='127.0.0.1', port=5000)
```

### 輸入驗證

目前實作未對輸入進行嚴格驗證，擴充時請注意：
- 驗證所有使用者輸入
- 限制可執行的按鍵範圍
- 避免 SQL injection、命令注入等風險

### 存取控制

可考慮加入：
- API Token 驗證
- IP 白名單
- HTTPS 加密傳輸

## 注意事項

### 系統需求
- **僅支援 Windows**：AutoHotkey 是 Windows 專用工具
- **需要 v2 版本**：AutoHotkey v1 與 v2 語法不相容
- **管理員權限**：某些應用程式可能需要以管理員身分執行

### 效能考量
- API 呼叫會有網路延遲（通常 < 50ms）
- AutoHotkey 腳本執行速度非常快
- 複雜腳本可能需要調整 Sleep 時間

### 開發建議
- 使用 `debug=True` 方便開發除錯
- 生產環境應設為 `debug=False`
- 考慮加入日誌記錄功能
- 定期更新依賴套件版本

## 授權與貢獻

本專案為開源專案，歡迎提交 Issue 和 Pull Request。

### 相關連結
- [AutoHotkey v2 官方文件](https://www.autohotkey.com/docs/v2/)
- [Flask 官方文件](https://flask.palletsprojects.com/)
- [uv 套件管理工具](https://github.com/astral-sh/uv)
