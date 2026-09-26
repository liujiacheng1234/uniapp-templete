import { defineStore } from 'pinia'
import { uniStorage } from '@/utils/storage'
import {
  DEFAULT_THEME_PRESET,
  THEME_PRESET_KEYS,
  type ThemeMode,
  type ThemePreset,
} from '@/themes/presets'

export type { ThemePreset, ThemeMode } from '@/themes/presets'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    preset: DEFAULT_THEME_PRESET as ThemePreset,
    mode: 'light' as ThemeMode,
  }),
  actions: {
    setPreset(preset: ThemePreset) {
      this.preset = preset
    },
    togglePreset() {
      const currentIndex = THEME_PRESET_KEYS.indexOf(this.preset)
      const nextIndex = (currentIndex + 1) % THEME_PRESET_KEYS.length
      this.preset = THEME_PRESET_KEYS[nextIndex] ?? DEFAULT_THEME_PRESET
    },
    setMode(mode: ThemeMode) {
      this.mode = mode
    },
  },
  persist: {
    storage: uniStorage,
    paths: ['preset', 'mode'],
  },
})
