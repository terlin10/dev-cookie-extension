# Dev Cookie Manager 🍪

一款專為前端工程師打造的 Chrome 擴充功能（Chrome Extension），專注於高效管理、偵錯與批次更新當前網頁的 **Cookie**。

採用 **Vue 3 + Vite + TypeScript + Tailwind CSS**，並融入現代 **Material Design 3 (M3)** 溫暖烘焙餅乾風格設計。

---

## ✨ 核心特色與功能

* 🍪 **純粹專注 Cookie 管理**：去除繁雜的 storage 切換，專為 Cookie 調試打造。
* 🎨 **Material Design 3 溫暖餅乾風格**：可愛的方形餅乾圖示、M3 卡片排版、流暢收合與焦糖主題色調。
* 🔍 **進階邏輯搜尋（支援 `&` 及 `|`）**：
  * 支援以 `&` (AND) 及 `|` (OR) 多關鍵字精準或複合篩選（`&` 優先度高於 `|`，不區分大小寫）。
  * 範例：`token & auth | user`（相當於 `(token 且 auth) 或 user`）。
* ⚡ **搜尋結果即時批次更新（Batch Update）**：
  * 當搜尋列篩選出目標 Cookie 時，搜尋框正下方展開批次更新工具列。
  * 輸入新的 Value，點擊「更新全部」，即可將所有篩選出的 Cookie 的 Value 統一更新並儲存，同時完整保留既有的 Domain、Path、HttpOnly、Secure 與過期時間等設定！
* ➕ **Material 3 浮動按鈕 (FAB)**：右下角懸浮按鈕，一鍵在清單頂部新增 Cookie。
* 📝 **完整屬性編輯**：
  * 檢視並自由修改 Value、Domain、Path、SameSite、過期時間（Expiration Date / Session）、HttpOnly、Secure。
  * 變更 Domain / Path 時自動執行平滑置換遷移。
* 🔄 **雙模式開發支援 (Dual Mode)**：
  * **Web Dev Mode**：在一般瀏覽器中（執行 `pnpm dev`）自動啟用 Mock 資料，方便本機端 UI 測試。
  * **Extension Mode**：載入 Chrome 後，即時調用瀏覽器官方 `chrome.cookies` API 讀寫實體網頁 Cookie。

---

## 🛠️ 安裝與使用指南

### 1. 安裝相依套件

在專案目錄下執行：
```bash
pnpm install
```

---

### 2. 本機開發模式 (Web Dev Mode)

若要快速在瀏覽器開發或預覽 UI：
```bash
pnpm dev
```
打開瀏覽器終端顯示的網址（例如 `http://localhost:5173`）即可測試。

---

### 3. 打包與安裝至 Chrome 瀏覽器 (Extension Mode)

#### 步驟 A：編譯打包
在終端機執行：
```bash
pnpm run build
```
打包完成後會於專案根目錄產生 `dist` 資料夾。

#### 步驟 B：載入 Chrome
1. 打開 Chrome 瀏覽器，網址列輸入 `chrome://extensions/` 並按 Enter。
2. 開啟右上角 **「開發者模式」（Developer mode）**。
3. 點擊左上角 **「載入未封裝項目」（Load unpacked）**。
4. 選擇此專案根目錄下的 **`dist`** 資料夾。

#### 步驟 C：開始使用
1. 點擊 Chrome 右上角的擴充功能拼圖圖示，將 **Dev Cookie Manager** 固定至工具列。
2. 前往任何網站點擊餅乾圖示，即可隨時管理與批次更新 Cookie！
