import type { CookieItem } from '@/types/cookie'

/**
 * 依據布林表達式（支援 & 和 |，其中 & 優先度高於 |）過濾 Cookie 列表
 * 比對不區分大小寫，單一關鍵字比對 Cookie 的 key 或 value
 * 
 * 範例：
 * "auth & token | user" 相當於 (auth AND token) OR user
 */
export function filterCookies(cookies: CookieItem[], query: string): CookieItem[] {
  const trimmed = query.trim()
  if (!trimmed) {
    return cookies
  }

  // 1. 以 "|" 切割成多個 OR 條件組
  // 任一組為 true，則該 Cookie 符合條件
  const orGroups = trimmed
    .split('|')
    .map(g => g.trim())
    .filter(g => g.length > 0)

  if (orGroups.length === 0) {
    return cookies
  }

  return cookies.filter(cookie => {
    const keyLower = cookie.key.toLowerCase()
    const valueLower = cookie.value.toLowerCase()

    // 檢查是否符合任一 OR 組
    return orGroups.some(group => {
      // 2. 在每個 OR 組內，以 "&" 切割成多個 AND 條件
      const andTerms = group
        .split('&')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)

      if (andTerms.length === 0) {
        return false
      }

      // 該組的所有 AND 條件都必須符合
      return andTerms.every(term => {
        return keyLower.includes(term) || valueLower.includes(term)
      })
    })
  })
}
