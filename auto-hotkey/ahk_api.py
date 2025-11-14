"""
AutoHotkey API Server
提供 HTTP API 來觸發 AutoHotkey 按鍵操作
"""

from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

# AutoHotkey 執行檔路徑（請根據實際安裝路徑調整）
AHK_EXE = r"D:\\4_harddisk_c\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe"

@app.route('/press_enter', methods=['POST'])
def press_enter():
    """先按方向鍵左鍵，等待 0.5 秒，最後按 Enter"""
    try:
        # 使用 AutoHotkey v2 執行按鍵指令
        script = '''Send "{Left}"
Sleep 500
Send "{Enter}"'''
        subprocess.run([AHK_EXE, '*'], input=script.encode('utf-8'), check=True)
        return jsonify({"status": "success", "message": "Left arrow, then Enter pressed"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """健康檢查端點"""
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    print("AutoHotkey API Server 啟動中...")
    print("可用端點:")
    print("  POST http://localhost:5000/press_enter - 按下 Enter 鍵")
    print("  GET  http://localhost:5000/health - 健康檢查")
    app.run(host='0.0.0.0', port=5000, debug=True)
