<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CookieItem } from '@/types/cookie'

const props = defineProps<{
  item: CookieItem
}>()

const emit = defineEmits<{
  (e: 'save', item: CookieItem): void
  (e: 'delete'): void
}>()

// 展開狀態
const isExpanded = ref(props.item.isNew ?? false)

// 轉換時間格式用 (YYYY-MM-DDTHH:mm)
const expirationDatetimeLocal = computed({
  get() {
    if (!props.item.expirationDate) return ''
    const date = new Date(props.item.expirationDate * 1000)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  },
  set(newValue: string) {
    if (!newValue) {
      props.item.expirationDate = undefined
      return
    }
    props.item.expirationDate = Math.floor(new Date(newValue).getTime() / 1000)
  }
})

// 檢查各屬性是否有異動
const isModified = computed(() => {
  const i = props.item
  const valChanged = i.value !== i.originalValue
  const domainChanged = i.domain !== i.originalDomain
  const pathChanged = i.path !== i.originalPath
  const secureChanged = i.secure !== i.originalSecure
  const httpOnlyChanged = i.httpOnly !== i.originalHttpOnly
  const sameSiteChanged = i.sameSite !== i.originalSameSite
  const sessionChanged = i.session !== i.originalSession
  const expChanged = !i.session && i.expirationDate !== i.originalExpirationDate

  return valChanged || domainChanged || pathChanged || secureChanged || httpOnlyChanged || sameSiteChanged || sessionChanged || expChanged
})

// 可儲存條件
const canSave = computed(() => {
  return props.item.key.trim() !== '' && (isModified.value || props.item.isNew)
})
</script>

<template>
  <div
    class="flex flex-col p-3.5 bg-white border rounded-2xl transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    :class="[
      isModified
        ? 'border-[#E07A43] bg-[#FFF8F3] shadow-[0_2px_8px_rgba(224,122,67,0.12)]'
        : 'border-[#EADFD7] hover:border-[#D5C2B4]'
    ]"
  >
    <!-- 第一排：基本資訊與快速操作 -->
    <div class="flex items-start gap-2.5">
      <!-- 展開/收合 按鈕 -->
      <button
        type="button"
        @click="isExpanded = !isExpanded"
        class="w-7 h-7 rounded-full flex items-center justify-center text-[#7E6E64] hover:bg-[#F4ECE5] hover:text-[#241E1A] mt-1 cursor-pointer transition-colors"
        :title="isExpanded ? '收合設定' : '展開設定'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <!-- 主要輸入欄位 (Key & Value) -->
      <div class="flex-1 flex flex-col gap-1.5 min-w-0">
        <!-- Cookie Key -->
        <div class="flex items-center gap-2">
          <input
            v-if="props.item.isNew"
            v-model="props.item.key"
            type="text"
            placeholder="輸入 Cookie 名稱 (Key)..."
            class="flex-1 bg-[#FAF6F2] border border-[#D5C2B4] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#8B4513] outline-none focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38]"
          />
          <span
            v-else
            class="text-xs font-bold text-[#8B4513] truncate select-text tracking-wide"
            :title="props.item.key"
          >
            {{ props.item.key }}
          </span>

          <span
            v-if="isModified"
            class="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-[#FFE8D6] text-[#C26D38] border border-[#F5C7A9]"
          >
            已變更
          </span>
        </div>

        <!-- Cookie Value -->
        <textarea
          v-model="props.item.value"
          placeholder="Value..."
          class="w-full bg-[#FAF7F3] border border-[#EADFD7] rounded-xl px-2.5 py-1.5 text-xs text-[#241E1A] font-mono outline-none resize-y min-h-[36px] focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38] transition-colors leading-relaxed"
          rows="1"
        ></textarea>
      </div>

      <!-- 右側動作按鈕 (儲存 & 刪除) -->
      <div class="flex flex-col gap-1.5 justify-center mt-0.5">
        <button
          type="button"
          class="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
          :class="[
            canSave
              ? 'bg-[#C26D38] text-white hover:bg-[#A95624] shadow-xs'
              : 'bg-[#F4ECE5] text-[#A6978C]'
          ]"
          :disabled="!canSave"
          @click="emit('save', props.item)"
          title="儲存變更"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>

        <button
          type="button"
          class="w-7 h-7 rounded-full bg-[#F4ECE5] text-[#7E6E64] flex items-center justify-center cursor-pointer transition-all duration-200 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
          @click="emit('delete')"
          title="刪除 Cookie"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 狀態標籤快捷列（M3 Chips 風格，收合時呈現，三種不同配色區分狀態） -->
    <div v-if="!isExpanded" class="flex flex-wrap gap-1.5 mt-2 ml-9.5">
      <span
        v-if="props.item.httpOnly"
        class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
      >
        HttpOnly
      </span>
      <span
        v-if="props.item.secure"
        class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
      >
        Secure
      </span>
      <!-- SameSite: 焦糖暖茶色 -->
      <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF1E5] text-[#9A4B1A] border border-[#FAD3B8]">
        SameSite: {{ props.item.sameSite === 'no_restriction' ? 'None' : props.item.sameSite }}
      </span>
      <!-- Session / Persistent: 淡暮薰衣草色 -->
      <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F2EDF8] text-[#5C457D] border border-[#DDD0ED]">
        {{ props.item.session ? 'Session' : 'Persistent' }}
      </span>
      <!-- Domain: 冰島藍灰色 -->
      <span
        v-if="props.item.domain"
        class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EBF3F8] text-[#285A7E] border border-[#CDE1EE] max-w-[140px] truncate"
        :title="props.item.domain"
      >
        {{ props.item.domain }}
      </span>
    </div>

    <!-- 詳細設定面板（展開時呈現） -->
    <div
      v-if="isExpanded"
      class="mt-3 pt-3 border-t border-[#EFE5DC] flex flex-col gap-2.5 ml-9.5 text-xs text-[#241E1A]"
    >
      <div class="grid grid-cols-2 gap-2.5">
        <!-- Domain -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-[#7E6E64] font-medium">Domain</label>
          <input
            v-model="props.item.domain"
            type="text"
            placeholder="例如: .example.com"
            class="bg-[#FAF7F3] border border-[#EADFD7] rounded-xl px-2.5 py-1.5 text-xs text-[#241E1A] outline-none focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38]"
          />
        </div>

        <!-- Path -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-[#7E6E64] font-medium">Path</label>
          <input
            v-model="props.item.path"
            type="text"
            placeholder="例如: /"
            class="bg-[#FAF7F3] border border-[#EADFD7] rounded-xl px-2.5 py-1.5 text-xs text-[#241E1A] outline-none focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38]"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <!-- SameSite -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-[#7E6E64] font-medium">SameSite</label>
          <select
            v-model="props.item.sameSite"
            class="bg-[#FAF7F3] border border-[#EADFD7] rounded-xl px-2 py-1.5 text-xs text-[#241E1A] outline-none focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38] cursor-pointer"
          >
            <option value="unspecified">Unspecified (預設)</option>
            <option value="lax">Lax</option>
            <option value="strict">Strict</option>
            <option value="no_restriction">None (無限制)</option>
          </select>
        </div>

        <!-- Session Toggle -->
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-[#7E6E64] font-medium">生命週期</label>
          <label class="flex items-center gap-2 py-1.5 cursor-pointer select-none">
            <input
              v-model="props.item.session"
              type="checkbox"
              class="w-4 h-4 rounded text-[#C26D38] accent-[#C26D38] cursor-pointer"
            />
            <span class="text-xs text-[#241E1A]">Session (關閉即逝)</span>
          </label>
        </div>
      </div>

      <!-- Expiration Date Selector (當非 Session Cookie 時顯示) -->
      <div v-if="!props.item.session" class="flex flex-col gap-1">
        <label class="text-[11px] text-[#7E6E64] font-medium">過期時間 (Expiration Date)</label>
        <input
          v-model="expirationDatetimeLocal"
          type="datetime-local"
          class="bg-[#FAF7F3] border border-[#EADFD7] rounded-xl px-2.5 py-1.5 text-xs text-[#241E1A] outline-none focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38] cursor-pointer font-mono"
        />
      </div>

      <!-- Checkbox 選項群 (HttpOnly, Secure) -->
      <div class="flex items-center gap-5 mt-1 pt-2 border-t border-[#F4ECE5]">
        <!-- HttpOnly -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="props.item.httpOnly"
            type="checkbox"
            class="w-4 h-4 rounded text-[#C26D38] accent-[#C26D38] cursor-pointer"
          />
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-[#241E1A]">HttpOnly</span>
            <span class="text-[10px] text-[#8E8076]">防 Client JS 讀取</span>
          </div>
        </label>

        <!-- Secure -->
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="props.item.secure"
            type="checkbox"
            class="w-4 h-4 rounded text-[#C26D38] accent-[#C26D38] cursor-pointer"
          />
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-[#241E1A]">Secure</span>
            <span class="text-[10px] text-[#8E8076]">限 HTTPS 傳輸</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
