import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_PRESET,
  darkThemePresets,
  getThemeDefinition,
  lightThemePresets,
} from '@/themes/presets'
import { CommonCode, UserCode } from '@/api/business-code'

describe('主题预设（themes/presets）', () => {
  it('brand-green 浅色：palette 与 CSS 变量同源（页面色 = filledBottom）', () => {
    const theme = getThemeDefinition('brand-green')
    expect(theme.palette.brand).toBe('#16a34a')
    expect(theme.palette.page).toBe(theme.themeVars.filledBottom)
    expect(theme.palette.border).toBe(theme.themeVars.borderMain)
    expect(theme.native.navigationBarFront).toBe('#000000')
  })

  it('contrast 浅色：允许 surface 覆盖', () => {
    const theme = getThemeDefinition('contrast')
    expect(theme.themeVars.primary5).toBe('#60a5fa')
    expect(theme.palette.surface).toBe('#eef2ff')
  })

  it('未知 key 回退默认主题（浅色）', () => {
    expect(getThemeDefinition('not-exist' as never)).toBe(lightThemePresets[DEFAULT_THEME_PRESET])
    expect(getThemeDefinition('not-exist' as never, 'dark')).toBe(
      darkThemePresets[DEFAULT_THEME_PRESET]
    )
  })

  it('深色模式：token 反转（深底浅字），原生导航栏前景为白', () => {
    const dark = getThemeDefinition('brand-green', 'dark')
    expect(dark).toBe(darkThemePresets['brand-green'])
    // 文字为浅色、页面底为深色
    expect(dark.themeVars.textMain).toBe('#dfeee5')
    expect(dark.themeVars.filledBottom).toBe('#121a15')
    // 主色在暗色下提亮一档（区别于浅色 #16a34a）
    expect(dark.themeVars.primary5).toBe('#2eb366')
    expect(dark.native.navigationBarFront).toBe('#ffffff')
    // palette 与 CSS 变量同源
    expect(dark.palette.page).toBe(dark.themeVars.filledBottom)
    expect(dark.palette.ink).toBe(dark.themeVars.textMain)
  })

  it('同一预设的深浅定义互不共享（浅色值不得穿透到暗色）', () => {
    for (const preset of Object.keys(lightThemePresets) as (keyof typeof lightThemePresets)[]) {
      expect(getThemeDefinition(preset, 'dark')).not.toBe(getThemeDefinition(preset, 'light'))
      expect(getThemeDefinition(preset, 'dark').themeVars.filledBottom).not.toBe(
        getThemeDefinition(preset, 'light').themeVars.filledBottom
      )
    }
  })

  it('所有预设（含深色）都具备完整 palette 关键色', () => {
    for (const bank of [lightThemePresets, darkThemePresets]) {
      for (const preset of Object.values(bank)) {
        for (const key of ['primary', 'ink', 'page', 'card', 'border', 'danger', 'warning'] as const) {
          expect(preset.palette[key], `${key}`).toBeTruthy()
        }
      }
    }
  })
})

describe('业务码（api/business-code）', () => {
  it('请求层依赖的最小码值集合稳定', () => {
    expect(CommonCode.SUCCESS).toBe(200)
    expect(CommonCode.INTERNAL_ERROR).toBe(100999)
    expect(UserCode.UNAUTHORIZED).toBe(200001)
    expect(UserCode.SESSION_EXPIRED).toBe(200004)
    expect(UserCode.USER_NOT_REGISTERED).toBe(200003)
  })
})
