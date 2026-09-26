import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

/**
 * 主题组合式：封装 theme store，供页面/组件读写当前预设与模式。
 */
export function useTheme() {
  const store = useThemeStore()
  const { preset, mode } = storeToRefs(store)
  return {
    preset,
    mode,
    setPreset: store.setPreset,
    togglePreset: store.togglePreset,
    setMode: store.setMode,
  }
}
