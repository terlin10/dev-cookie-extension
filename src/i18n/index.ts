import { ref, computed } from 'vue'

export type Locale = 'zh-TW' | 'en'

export const messages = {
  'zh-TW': {
    appName: 'Dev Cookie Manager',
    extensionMode: 'Extension Mode',
    webDevMode: 'Web Dev Mode',
    reloadTooltip: '重新載入 Cookie',
    searchPlaceholder: '搜尋 Cookie (支援 & 及 | 運算，如: token & auth | user)...',
    clearSearchTooltip: '清除搜尋',
    batchValuePlaceholder: '輸入新 Value 批次覆蓋篩選結果...',
    batchUpdateBtn: '更新全部',
    searchResultCount: '搜尋結果：{filtered} 筆 (共 {total} 筆)',
    totalCount: '共 {total} 筆 Cookie',
    logicBadge: '支援 & (AND) 及 | (OR)',
    loading: '讀取 Cookie 中...',
    emptySearch: '沒有符合條件的 Cookie',
    emptyList: '此網址目前沒有任何 Cookie',
    addCookieTooltip: '新增 Cookie',
    
    // Cookie Card
    keyPlaceholder: '輸入 Cookie 名稱 (Key)...',
    valuePlaceholder: 'Value...',
    modifiedBadge: '已變更',
    expandTooltip: '展開設定',
    collapseTooltip: '收合設定',
    saveTooltip: '儲存變更',
    deleteTooltip: '刪除 Cookie',
    
    // Chips & Labels
    httpOnly: 'HttpOnly',
    secure: 'Secure',
    sameSite: 'SameSite',
    session: 'Session',
    persistent: 'Persistent',
    
    // Expanded Panel
    domainLabel: 'Domain',
    domainPlaceholder: '例如: .example.com',
    pathLabel: 'Path',
    pathPlaceholder: '例如: /',
    sameSiteLabel: 'SameSite',
    sameSiteUnspecified: 'Unspecified (預設)',
    sameSiteLax: 'Lax',
    sameSiteStrict: 'Strict',
    sameSiteNone: 'None (無限制)',
    lifetimeLabel: '生命週期',
    sessionCheckbox: 'Session (關閉即逝)',
    expirationLabel: '過期時間 (Expiration Date)',
    httpOnlyDesc: '防 Client JS 讀取',
    secureDesc: '限 HTTPS 傳輸',
    
    // Toasts
    tabUrlError: '無法取得當前分頁 URL，請至標準網頁分頁使用',
    loadFailed: '載入 Cookie 失敗: {msg}',
    saveSuccess: '已成功儲存 Cookie: {key}',
    saveFailed: '儲存失敗: {msg}',
    deleteSuccess: '已刪除 Cookie: {key}',
    deleteFailed: '刪除失敗: {msg}',
    batchNoItems: '目前沒有可更新的 Cookie',
    batchSuccess: '已成功批次更新 {count} 筆 Cookie！',
    mockSaved: '[Mock] 已儲存 Cookie: {key}',
    mockDeleted: '[Mock] 已刪除 Cookie: {key}',
    mockBatchSuccess: '[Mock] 已批次更新 {count} 筆 Cookie！',
  },
  'en': {
    appName: 'Dev Cookie Manager',
    extensionMode: 'Extension Mode',
    webDevMode: 'Web Dev Mode',
    reloadTooltip: 'Reload Cookies',
    searchPlaceholder: 'Search cookies (supports & and |, e.g., token & auth | user)...',
    clearSearchTooltip: 'Clear search',
    batchValuePlaceholder: 'Enter new value to batch replace filtered...',
    batchUpdateBtn: 'Update All',
    searchResultCount: 'Results: {filtered} of {total}',
    totalCount: '{total} cookies total',
    logicBadge: '& (AND) / | (OR) supported',
    loading: 'Loading cookies...',
    emptySearch: 'No cookies found matching query',
    emptyList: 'No cookies found for this URL',
    addCookieTooltip: 'Add Cookie',
    
    // Cookie Card
    keyPlaceholder: 'Enter Cookie name (Key)...',
    valuePlaceholder: 'Value...',
    modifiedBadge: 'Modified',
    expandTooltip: 'Expand settings',
    collapseTooltip: 'Collapse settings',
    saveTooltip: 'Save changes',
    deleteTooltip: 'Delete Cookie',
    
    // Chips & Labels
    httpOnly: 'HttpOnly',
    secure: 'Secure',
    sameSite: 'SameSite',
    session: 'Session',
    persistent: 'Persistent',
    
    // Expanded Panel
    domainLabel: 'Domain',
    domainPlaceholder: 'e.g., .example.com',
    pathLabel: 'Path',
    pathPlaceholder: 'e.g., /',
    sameSiteLabel: 'SameSite',
    sameSiteUnspecified: 'Unspecified (Default)',
    sameSiteLax: 'Lax',
    sameSiteStrict: 'Strict',
    sameSiteNone: 'None (No restriction)',
    lifetimeLabel: 'Lifetime',
    sessionCheckbox: 'Session (Discard when closed)',
    expirationLabel: 'Expiration Date',
    httpOnlyDesc: 'Block Client JS access',
    secureDesc: 'HTTPS only',
    
    // Toasts
    tabUrlError: 'Cannot get active tab URL, please open on a valid webpage',
    loadFailed: 'Failed to load cookies: {msg}',
    saveSuccess: 'Saved cookie successfully: {key}',
    saveFailed: 'Save failed: {msg}',
    deleteSuccess: 'Deleted cookie: {key}',
    deleteFailed: 'Delete failed: {msg}',
    batchNoItems: 'No cookies available to update',
    batchSuccess: 'Batch updated {count} cookies successfully!',
    mockSaved: '[Mock] Saved cookie: {key}',
    mockDeleted: '[Mock] Deleted cookie: {key}',
    mockBatchSuccess: '[Mock] Batch updated {count} cookies!',
  }
}

// 偵測預設語系（先讀取儲存的偏好，若無則依據系統/瀏覽器語系）
function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('dev_cookie_locale')
    if (saved === 'zh-TW' || saved === 'en') {
      return saved
    }
  } catch (e) {}

  const browserLang = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh-TW'
  }
  return 'en'
}

export const currentLocale = ref<Locale>(detectInitialLocale())

export function setLocale(locale: Locale) {
  currentLocale.value = locale
  try {
    localStorage.setItem('dev_cookie_locale', locale)
  } catch (e) {}
}

export function toggleLocale() {
  setLocale(currentLocale.value === 'zh-TW' ? 'en' : 'zh-TW')
}

export function t(key: keyof typeof messages['zh-TW'], params?: Record<string, string | number>): string {
  const dict = messages[currentLocale.value] || messages['zh-TW']
  let text = dict[key] || messages['zh-TW'][key] || key

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
    }
  }

  return text
}
