<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import CookieItemCard from '@/components/CookieItemCard.vue'
import type { CookieItem } from '@/types/cookie'
import { filterCookies } from '@/utils/searchParser'
import { t, currentLocale, toggleLocale } from '@/i18n'

const items = ref<CookieItem[]>([])
const searchQuery = ref('')
const batchValue = ref('')
const loading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)

// Toast 提示
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: number | null = null

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 判斷是否在 Chrome Extension 環境
const isExtensionEnv = computed(() => {
  return typeof chrome !== 'undefined' && chrome.cookies !== undefined
})

// 取得當前作用中分頁的 URL
const getActiveTabUrl = async (): Promise<string | null> => {
  if (!isExtensionEnv.value) return null
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    return tabs[0]?.url || null
  } catch (err) {
    console.error('無法取得分頁 URL:', err)
    return null
  }
}

// 載入 Cookie
const loadCookies = async () => {
  loading.value = true
  if (isExtensionEnv.value) {
    const url = await getActiveTabUrl()
    if (!url) {
      showToast(t('tabUrlError'), 'error')
      loading.value = false
      return
    }
    try {
      const chromeCookies = await chrome.cookies.getAll({ url })
      items.value = chromeCookies.map(cookie => ({
        key: cookie.name,
        value: cookie.value,
        originalValue: cookie.value,
        domain: cookie.domain,
        originalDomain: cookie.domain,
        path: cookie.path,
        originalPath: cookie.path,
        secure: cookie.secure,
        originalSecure: cookie.secure,
        httpOnly: cookie.httpOnly,
        originalHttpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        originalSameSite: cookie.sameSite,
        session: cookie.session,
        originalSession: cookie.session,
        expirationDate: cookie.expirationDate,
        originalExpirationDate: cookie.expirationDate,
        isNew: false
      }))
    } catch (err: any) {
      showToast(t('loadFailed', { msg: err.message }), 'error')
    }
  } else {
    // Web Dev Mock 資料
    items.value = [
      {
        key: 'session_token',
        value: 'mock_jwt_eyJhY2Nlc3NfdG9rZW4iOiIyM2JjNDU2N2EiLCJleHAiOjE3MTk4Mzg4MDB9',
        originalValue: 'mock_jwt_eyJhY2Nlc3NfdG9rZW4iOiIyM2JjNDU2N2EiLCJleHAiOjE3MTk4Mzg4MDB9',
        domain: 'localhost',
        originalDomain: 'localhost',
        path: '/',
        originalPath: '/',
        secure: false,
        originalSecure: false,
        httpOnly: true,
        originalHttpOnly: true,
        sameSite: 'lax',
        originalSameSite: 'lax',
        session: true,
        originalSession: true,
        isNew: false
      },
      {
        key: 'user_auth_id',
        value: 'usr_889214_developer',
        originalValue: 'usr_889214_developer',
        domain: 'localhost',
        originalDomain: 'localhost',
        path: '/',
        originalPath: '/',
        secure: false,
        originalSecure: false,
        httpOnly: false,
        originalHttpOnly: false,
        sameSite: 'lax',
        originalSameSite: 'lax',
        session: false,
        originalSession: false,
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 7,
        originalExpirationDate: Math.floor(Date.now() / 1000) + 86400 * 7,
        isNew: false
      },
      {
        key: 'theme_preference',
        value: 'cookie_caramel',
        originalValue: 'cookie_caramel',
        domain: 'localhost',
        originalDomain: 'localhost',
        path: '/',
        originalPath: '/',
        secure: true,
        originalSecure: true,
        httpOnly: false,
        originalHttpOnly: false,
        sameSite: 'strict',
        originalSameSite: 'strict',
        session: false,
        originalSession: false,
        expirationDate: Math.floor(Date.now() / 1000) + 86400 * 30,
        originalExpirationDate: Math.floor(Date.now() / 1000) + 86400 * 30,
        isNew: false
      }
    ]
  }
  loading.value = false
}

// 儲存單一 Cookie
const saveCookie = async (item: CookieItem) => {
  if (isExtensionEnv.value) {
    const url = await getActiveTabUrl()
    if (!url) {
      showToast(t('tabUrlError'), 'error')
      return
    }

    try {
      const details: chrome.cookies.SetDetails = {
        url,
        name: item.key,
        value: item.value,
        domain: item.domain || undefined,
        path: item.path || undefined,
        secure: item.secure,
        httpOnly: item.httpOnly
      }

      if (item.sameSite !== 'unspecified') {
        details.sameSite = item.sameSite
      }

      if (!item.session && item.expirationDate) {
        details.expirationDate = item.expirationDate
      }

      // 若 Domain 或 Path 異動，先移除舊的再寫入新的
      if (!item.isNew && (item.domain !== item.originalDomain || item.path !== item.originalPath)) {
        const cleanDomain = item.originalDomain.startsWith('.') ? item.originalDomain.substring(1) : item.originalDomain
        const oldUrl = `http${item.originalSecure ? 's' : ''}://${cleanDomain}${item.originalPath}`
        try {
          await chrome.cookies.remove({
            url: oldUrl,
            name: item.key
          })
        } catch (e) {
          console.warn('移除舊 Cookie 失敗，直接寫入新 Cookie:', e)
        }
      }

      await chrome.cookies.set(details)

      // 同步原始快照
      item.originalValue = item.value
      item.originalDomain = item.domain
      item.originalPath = item.path
      item.originalSecure = item.secure
      item.originalHttpOnly = item.httpOnly
      item.originalSameSite = item.sameSite
      item.originalSession = item.session
      item.originalExpirationDate = item.expirationDate
      item.isNew = false

      showToast(t('saveSuccess', { key: item.key }), 'success')
    } catch (err: any) {
      showToast(t('saveFailed', { msg: err.message }), 'error')
    }
  } else {
    // Mock 儲存
    item.originalValue = item.value
    item.originalDomain = item.domain
    item.originalPath = item.path
    item.originalSecure = item.secure
    item.originalHttpOnly = item.httpOnly
    item.originalSameSite = item.sameSite
    item.originalSession = item.session
    item.originalExpirationDate = item.expirationDate
    item.isNew = false
    showToast(t('mockSaved', { key: item.key }), 'success')
  }
}

// 刪除單一 Cookie
const deleteCookie = async (item: CookieItem, index: number) => {
  if (isExtensionEnv.value) {
    try {
      if (!item.isNew) {
        const cleanDomain = item.originalDomain.startsWith('.') ? item.originalDomain.substring(1) : item.originalDomain
        const oldUrl = `http${item.originalSecure ? 's' : ''}://${cleanDomain}${item.originalPath}`
        await chrome.cookies.remove({
          url: oldUrl,
          name: item.key
        })
      }
      items.value.splice(index, 1)
      showToast(t('deleteSuccess', { key: item.key }), 'success')
    } catch (err: any) {
      showToast(t('deleteFailed', { msg: err.message }), 'error')
    }
  } else {
    items.value.splice(index, 1)
    showToast(t('mockDeleted', { key: item.key }), 'success')
  }
}

// 新增空白 Cookie（由 FAB 觸發）
const addNewItem = async () => {
  let defaultDomain = ''
  const defaultPath = '/'

  if (isExtensionEnv.value) {
    const urlStr = await getActiveTabUrl()
    if (urlStr) {
      try {
        const parsed = new URL(urlStr)
        defaultDomain = parsed.hostname
      } catch (e) {}
    }
  } else {
    defaultDomain = 'localhost'
  }

  // 插入到清單最頂部
  items.value.unshift({
    key: '',
    value: '',
    originalValue: '',
    domain: defaultDomain,
    originalDomain: defaultDomain,
    path: defaultPath,
    originalPath: defaultPath,
    secure: false,
    originalSecure: false,
    httpOnly: false,
    originalHttpOnly: false,
    sameSite: 'unspecified',
    originalSameSite: 'unspecified',
    session: true,
    originalSession: true,
    isNew: true
  })

  // 若目前有搜尋關鍵字，清除以便完整看到新卡片
  if (searchQuery.value) {
    searchQuery.value = ''
  }

  // 自動平滑滾動至最頂端
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 搜尋過濾（支援 & 與 |）
const filteredItems = computed(() => {
  return filterCookies(items.value, searchQuery.value)
})

// 是否正在進行搜尋
const isSearching = computed(() => {
  return searchQuery.value.trim().length > 0
})

// 批次更新全部符合搜尋的 Cookie Value
const batchUpdateAll = async () => {
  const targetItems = filteredItems.value
  if (targetItems.length === 0) {
    showToast(t('batchNoItems'), 'error')
    return
  }

  const newValue = batchValue.value
  let successCount = 0

  if (isExtensionEnv.value) {
    const url = await getActiveTabUrl()
    if (!url) {
      showToast(t('tabUrlError'), 'error')
      return
    }

    loading.value = true
    for (const item of targetItems) {
      if (!item.key.trim()) continue
      try {
        const details: chrome.cookies.SetDetails = {
          url,
          name: item.key,
          value: newValue,
          domain: item.domain || undefined,
          path: item.path || undefined,
          secure: item.secure,
          httpOnly: item.httpOnly
        }

        if (item.sameSite !== 'unspecified') {
          details.sameSite = item.sameSite
        }

        if (!item.session && item.expirationDate) {
          details.expirationDate = item.expirationDate
        }

        await chrome.cookies.set(details)

        item.value = newValue
        item.originalValue = newValue
        item.isNew = false
        successCount++
      } catch (err) {
        console.error(`更新 ${item.key} 失敗:`, err)
      }
    }
    loading.value = false
    showToast(t('batchSuccess', { count: successCount }), 'success')
  } else {
    // Mock 批次更新
    for (const item of targetItems) {
      if (!item.key.trim()) continue
      item.value = newValue
      item.originalValue = newValue
      item.isNew = false
      successCount++
    }
    showToast(t('mockBatchSuccess', { count: successCount }), 'success')
  }
}

onMounted(() => {
  loadCookies()
})
</script>

<template>
  <div class="w-[460px] h-[580px] flex flex-col bg-[#FAF7F3] text-[#241E1A] relative select-none overflow-hidden font-sans">
    <!-- Material 3 Top App Bar -->
    <header class="flex justify-between items-center px-4 py-2.5 bg-white border-b border-[#EADFD7] shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
      <div class="flex items-center gap-2.5">
        <img
          src="/icon48.png"
          alt="Dev Cookie Icon"
          class="w-7 h-7 object-contain drop-shadow-xs"
        />
        <div class="flex flex-col">
          <h1 class="text-sm font-bold text-[#8B4513] tracking-tight leading-none">
            {{ t('appName') }}
          </h1>
          <span class="text-[10px] text-[#A6978C] font-medium mt-0.5">
            {{ isExtensionEnv ? t('extensionMode') : t('webDevMode') }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <!-- 語言切換按鈕 (繁中 / EN) -->
        <button
          type="button"
          @click="toggleLocale"
          class="px-2 py-1 rounded-full text-[11px] font-bold text-[#8B4513] bg-[#F4ECE5] hover:bg-[#EBDDCF] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
          :title="currentLocale === 'zh-TW' ? 'Switch to English' : '切換為繁體中文'"
        >
          <span class="text-xs">🌐</span>
          <span>{{ currentLocale === 'zh-TW' ? 'EN' : '繁中' }}</span>
        </button>

        <!-- 重新整理按鈕 -->
        <button
          type="button"
          @click="loadCookies"
          class="w-8 h-8 rounded-full flex items-center justify-center text-[#7E6E64] hover:bg-[#F4ECE5] hover:text-[#241E1A] transition-colors cursor-pointer"
          :title="t('reloadTooltip')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            :class="{ 'animate-spin': loading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        </button>
      </div>
    </header>

    <!-- 頂部搜尋與批次更新控制區 -->
    <div class="p-3.5 bg-[#FAF7F3] border-b border-[#EADFD7] flex flex-col gap-2.5 z-10">
      <!-- 搜尋列 -->
      <div class="relative flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute left-3 w-4 h-4 text-[#A6978C]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>

        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('searchPlaceholder')"
          class="w-full pl-9 pr-8 py-2 bg-white border border-[#EADFD7] rounded-xl text-xs text-[#241E1A] placeholder-[#A6978C] outline-none focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
        />

        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="absolute right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[#A6978C] hover:text-[#241E1A] hover:bg-[#F4ECE5] cursor-pointer"
          :title="t('clearSearchTooltip')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- 批次更新列（在搜尋時展開顯示於正下方） -->
      <transition name="slide-down">
        <div
          v-if="isSearching"
          class="flex items-center gap-2 p-2 bg-[#FFF8F3] border border-[#F5C7A9] rounded-xl shadow-xs"
        >
          <div class="relative flex-1">
            <input
              v-model="batchValue"
              type="text"
              :placeholder="t('batchValuePlaceholder')"
              class="w-full px-3 py-1.5 bg-white border border-[#EADFD7] rounded-lg text-xs text-[#241E1A] placeholder-[#A6978C] outline-none font-mono focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38]"
              @keydown.enter="batchUpdateAll"
            />
          </div>

          <button
            type="button"
            @click="batchUpdateAll"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C26D38] hover:bg-[#A95624] text-white font-medium text-xs rounded-lg cursor-pointer transition-colors shadow-xs shrink-0"
            :title="`將當前篩選出的 ${filteredItems.length} 筆 Cookie Value 全數更新`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {{ t('batchUpdateBtn') }} ({{ filteredItems.length }})
          </button>
        </div>
      </transition>

      <!-- 統計資訊小字 -->
      <div class="flex justify-between items-center px-1 text-[11px] text-[#A6978C]">
        <span>
          <template v-if="isSearching">
            {{ t('searchResultCount', { filtered: filteredItems.length, total: items.length }) }}
          </template>
          <template v-else>
            {{ t('totalCount', { total: items.length }) }}
          </template>
        </span>
        <span v-if="isSearching" class="text-[10px] text-[#C26D38] bg-[#FFE8D6] px-1.5 py-0.2 rounded font-medium">
          {{ t('logicBadge') }}
        </span>
      </div>
    </div>

    <!-- Cookie 清單卡片滾動區 -->
    <main ref="scrollContainer" class="flex-1 overflow-y-auto px-3.5 py-3">
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-2 text-[#A6978C]">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 animate-spin text-[#C26D38]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        <span class="text-xs">{{ t('loading') }}</span>
      </div>

      <div
        v-else-if="filteredItems.length === 0"
        class="flex flex-col items-center justify-center py-16 text-[#A6978C] gap-2"
      >
        <img src="/icon48.png" alt="Empty" class="w-10 h-10 opacity-40 grayscale" />
        <span class="text-xs">
          {{ isSearching ? t('emptySearch') : t('emptyList') }}
        </span>
      </div>

      <div v-else class="flex flex-col gap-2.5 pb-16">
        <CookieItemCard
          v-for="(item, idx) in filteredItems"
          :key="(item.key || 'new') + '-' + idx"
          :item="item"
          @save="saveCookie"
          @delete="deleteCookie(item, idx)"
        />
      </div>
    </main>

    <!-- Material 3 懸浮新增按鈕 (FAB) -->
    <button
      type="button"
      @click="addNewItem"
      class="absolute bottom-5 right-5 w-13 h-13 rounded-2xl bg-[#C26D38] hover:bg-[#A95624] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(194,109,56,0.38)] cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 z-20"
      :title="t('addCookieTooltip')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>

    <!-- Material Toast 提示 -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg bg-[#241E1A] text-white text-xs z-50 pointer-events-none flex items-center gap-2 max-w-[90%] truncate"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :class="toastType === 'success' ? 'bg-emerald-400' : 'bg-red-400'"
        ></span>
        <span class="truncate">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>
