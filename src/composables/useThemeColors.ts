import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { getThemeDefinition } from '@/themes/presets'

/**
 * 非 CSS 场景取色：按当前预设与深浅模式返回响应式色板。
 * 用于 map marker、uni.showModal.confirmColor、内联 color="" 等无法用 var(--wot-*) 的地方。
 */
export function useThemeColors() {
  const store = useThemeStore()
  const palette = computed(() => getThemeDefinition(store.preset, store.mode).palette)
  return { palette }
}
