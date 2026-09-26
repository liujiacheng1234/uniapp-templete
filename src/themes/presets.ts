import type { ConfigProviderThemeVars } from '@wot-ui/ui'

export const THEME_PRESET_KEYS = ['brand-green', 'contrast'] as const

export type ThemePreset = (typeof THEME_PRESET_KEYS)[number]

/**
 * 主题模式：浅色（默认）/ 深色。
 *
 * 深色已完整接线：mode 同时驱动 wd-config-provider 的 theme（组件库 token）与
 * 本文件 darkThemePresets（业务 token/palette/原生色），由 App.ku.vue 统一消费。
 * 唯一来源在本文件声明（stores/theme 反向 re-export），避免循环引用。
 */
export type ThemeMode = 'light' | 'dark'

export const DEFAULT_THEME_PRESET: ThemePreset = 'brand-green'

/**
 * 无法直接读取 CSS 变量的场景使用的响应式色板，例如地图、Canvas 与 uni 原生 API。
 * 页面 CSS 不应使用这里的色值，应消费 Wot 语义 token。
 */
export interface ThemePalette {
  primary: string
  brand: string
  resourceCyan: string
  resourceTeal: string
  ink: string
  body: string
  muted: string
  page: string
  surface: string
  card: string
  border: string
  warning: string
  danger: string
  info: string
  markerSelected: string
  scanDark: string
  lowBattery: string
  lowBatteryBg: string
}

export interface NativeThemeColors {
  pageBackground: string
  navigationBarBackground: string
  navigationBarFront: '#000000' | '#ffffff'
}

export interface AppThemeDefinition {
  themeVars: ConfigProviderThemeVars
  palette: ThemePalette
  native: NativeThemeColors
}

type PaletteBackedThemeVars = ConfigProviderThemeVars &
  Required<
    Pick<
      ConfigProviderThemeVars,
      | 'primary5'
      | 'primary6'
      | 'textMain'
      | 'textSecondary'
      | 'textAuxiliary'
      | 'filledBottom'
      | 'filledContent'
      | 'filledOppo'
      | 'borderMain'
      | 'warningMain'
      | 'warningSurface'
      | 'dangerMain'
    >
  >

/* ==========================================================================
 * 浅色模式（默认）
 * ========================================================================== */

const sharedThemeVars = {
  dangerMain: '#ef4444',
  dangerHover: '#f87171',
  dangerClicked: '#dc2626',
  dangerDisabled: '#fca5a5',
  dangerParticular: '#fee2e2',
  dangerSurface: '#fef2f2',
  successMain: '#16a34a',
  successHover: '#4ade80',
  successClicked: '#15803d',
  successDisabled: '#86efac',
  successParticular: '#bbf7d0',
  successSurface: '#f0fdf4',
  warningMain: '#ea580c',
  warningHover: '#fb923c',
  warningClicked: '#c2410c',
  warningDisabled: '#fdba74',
  warningParticular: '#ffedd5',
  warningSurface: '#fff7ed',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  borderWhite: '#ffffff',
  borderZero: 'transparent',
  filledZero: 'transparent',
  dividerMain: '#00000014',
  dividerLight: '#0000000a',
  dividerStrong: '#00000026',
  dividerWhite: '#ffffff',
  feedbackHover: '#0000000a',
  feedbackActive: '#00000014',
  opacfilledTooltipToastCover: '#000000bf',
  opacfilledMainCover: '#0000008c',
  opacfilledLightCover: '#0000004d',
  pickerViewMaskStartColor: '#ffffffd9',
  pickerViewMaskEndColor: '#ffffff33',
  classifyapplicationYellowBackground: '#fffaf1',
  classifyapplicationYellowBorder: '#fdd78c',
  classifyapplicationYellowContent: '#faad14',
  classifyapplicationCyanBackground: '#f4fbfd',
  classifyapplicationCyanBorder: '#bdeaf1',
  classifyapplicationCyanContent: '#22b8cf',
  classifyapplicationPurpleBackground: '#f9f8ff',
  classifyapplicationPurpleBorder: '#d0bfff',
  classifyapplicationPurpleContent: '#8059f3',
  classifyapplicationGrapeBackground: '#fbf6fd',
  classifyapplicationGrapeBorder: '#eebefa',
  classifyapplicationGrapeContent: '#ae3ec9',
  classifyapplicationPinkBackground: '#fff0f6',
  classifyapplicationPinkBorder: '#fcc2d7',
  classifyapplicationPinkContent: '#ff357c',
} satisfies ConfigProviderThemeVars

const brandGreenThemeVars = {
  ...sharedThemeVars,
  primary1: '#f0faf0',
  primary2: '#dbeedb',
  primary3: '#b8dfb4',
  primary4: '#7fc97b',
  primary5: '#16a34a',
  primary6: '#2e7d32',
  primary7: '#256b2a',
  primary8: '#1e561f',
  primary9: '#163f17',
  primary10: '#0d280e',
  textMain: '#123b2b',
  textSecondary: '#6b7f73',
  textAuxiliary: '#91a69a',
  textDisabled: '#bdd1c3',
  textPlaceholder: '#728579',
  iconMain: '#123b2b',
  iconSecondary: '#6b7f73',
  iconAuxiliary: '#91a69a',
  iconDisabled: '#bdd1c3',
  iconPlaceholder: '#728579',
  borderExtraStrong: '#91a69a',
  borderStrong: '#bdd1c3',
  borderMain: '#e7efe9',
  borderLight: '#eef4f0',
  filledExtraStrong: '#bdd1c3',
  filledStrong: '#d7e6dc',
  filledContent: '#e7f5ee',
  filledBottom: '#f6faf7',
  filledOppo: '#ffffff',
  feedbackAccent: '#2e7d3214',
} satisfies PaletteBackedThemeVars

const contrastThemeVars = {
  ...sharedThemeVars,
  primary1: '#eff6ff',
  primary2: '#dbeafe',
  primary3: '#bfdbfe',
  primary4: '#93c5fd',
  primary5: '#60a5fa',
  primary6: '#2563eb',
  primary7: '#1d4ed8',
  primary8: '#1e40af',
  primary9: '#1e3a8a',
  primary10: '#172554',
  textMain: '#1d1f29',
  textSecondary: '#4e5369',
  textAuxiliary: '#868a9c',
  textDisabled: '#c9cbd4',
  textPlaceholder: '#a9acb8',
  iconMain: '#1d1f29',
  iconSecondary: '#4e5369',
  iconAuxiliary: '#868a9c',
  iconDisabled: '#c9cbd4',
  iconPlaceholder: '#a9acb8',
  borderExtraStrong: '#868a9c',
  borderStrong: '#c9cbd4',
  borderMain: '#e5e6eb',
  borderLight: '#f2f3f5',
  filledExtraStrong: '#c9cbd4',
  filledStrong: '#e5e6eb',
  filledContent: '#f2f3f5',
  filledBottom: '#f7f8fa',
  filledOppo: '#ffffff',
  feedbackAccent: '#2563eb14',
} satisfies PaletteBackedThemeVars

/* ==========================================================================
 * 深色模式
 *
 * 机制：wd-config-provider theme="dark" 会启用组件库暗色基线（primary 色阶反转、
 * 中性色反转），本文件的 theme-vars 覆盖在其上。因此深色定义必须完整给出所有
 * 「会被浅色定义覆盖的键」，否则浅色值会穿透到暗色界面。
 * 色阶方向约定：暗色下 primary1 = 最深（用作暗色着色面），primary10 = 最浅，
 * 与浅色（primary1 最浅）相反，与组件库 dark 基线一致。
 * ========================================================================== */

const sharedDarkThemeVars = {
  // 语义色：暗色下整体提亮一档保证可读，底色改暗色着色面
  dangerMain: '#f87171',
  dangerHover: '#fca5a5',
  dangerClicked: '#ef4444',
  dangerDisabled: '#7f1d1d',
  dangerParticular: '#450a0a',
  dangerSurface: '#2a1011',
  successMain: '#4ade80',
  successHover: '#86efac',
  successClicked: '#22c55e',
  successDisabled: '#14532d',
  successParticular: '#052e16',
  successSurface: '#0d2618',
  warningMain: '#fb923c',
  warningHover: '#fdba74',
  warningClicked: '#f97316',
  warningDisabled: '#7c2d12',
  warningParticular: '#431407',
  warningSurface: '#2a160b',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
  borderWhite: '#ffffff',
  borderZero: 'transparent',
  filledZero: 'transparent',
  dividerMain: '#ffffff26',
  dividerLight: '#ffffff14',
  dividerStrong: '#ffffff40',
  dividerWhite: '#ffffff',
  feedbackHover: '#ffffff0a',
  feedbackActive: '#ffffff14',
  opacfilledTooltipToastCover: '#000000d9',
  opacfilledMainCover: '#000000a6',
  opacfilledLightCover: '#00000066',
  pickerViewMaskStartColor: '#000000b3',
  pickerViewMaskEndColor: '#00000033',
  classifyapplicationYellowBackground: '#26180a',
  classifyapplicationYellowBorder: '#6b4a1a',
  classifyapplicationYellowContent: '#fbbf24',
  classifyapplicationCyanBackground: '#0a2026',
  classifyapplicationCyanBorder: '#155e6b',
  classifyapplicationCyanContent: '#22d3ee',
  classifyapplicationPurpleBackground: '#1d1530',
  classifyapplicationPurpleBorder: '#5b3fa0',
  classifyapplicationPurpleContent: '#a78bfa',
  classifyapplicationGrapeBackground: '#251223',
  classifyapplicationGrapeBorder: '#7a2f74',
  classifyapplicationGrapeContent: '#e879f9',
  classifyapplicationPinkBackground: '#2a0f17',
  classifyapplicationPinkBorder: '#8c2f4a',
  classifyapplicationPinkContent: '#fb7185',
} satisfies ConfigProviderThemeVars

const brandGreenDarkThemeVars = {
  ...sharedDarkThemeVars,
  primary1: '#0c1a11',
  primary2: '#112419',
  primary3: '#173122',
  primary4: '#1e412c',
  primary5: '#2eb366',
  primary6: '#249656',
  primary7: '#1c7343',
  primary8: '#145531',
  primary9: '#0d3a21',
  primary10: '#e3f4e9',
  textMain: '#dfeee5',
  textSecondary: '#a3bcae',
  textAuxiliary: '#7e9486',
  textDisabled: '#4a5c51',
  textPlaceholder: '#5b6f62',
  iconMain: '#dfeee5',
  iconSecondary: '#a3bcae',
  iconAuxiliary: '#7e9486',
  iconDisabled: '#4a5c51',
  iconPlaceholder: '#5b6f62',
  borderExtraStrong: '#46584d',
  borderStrong: '#38493f',
  borderMain: '#2c3a32',
  borderLight: '#223028',
  filledExtraStrong: '#38493f',
  filledStrong: '#27352d',
  filledContent: '#1b2620',
  filledBottom: '#121a15',
  filledOppo: '#1d2a22',
  feedbackAccent: '#2eb36614',
} satisfies PaletteBackedThemeVars

const contrastDarkThemeVars = {
  ...sharedDarkThemeVars,
  primary1: '#0a1120',
  primary2: '#0f1830',
  primary3: '#152142',
  primary4: '#1c2f5c',
  primary5: '#60a5fa',
  primary6: '#3b82f6',
  primary7: '#2f6fd0',
  primary8: '#2456a3',
  primary9: '#1a3e77',
  primary10: '#dbeafe',
  textMain: '#e2e8f0',
  textSecondary: '#94a3b8',
  textAuxiliary: '#64748b',
  textDisabled: '#3f4a5c',
  textPlaceholder: '#4d5a70',
  iconMain: '#e2e8f0',
  iconSecondary: '#94a3b8',
  iconAuxiliary: '#64748b',
  iconDisabled: '#3f4a5c',
  iconPlaceholder: '#4d5a70',
  borderExtraStrong: '#475569',
  borderStrong: '#3a4657',
  borderMain: '#2d3746',
  borderLight: '#232c39',
  filledExtraStrong: '#3a4657',
  filledStrong: '#28313f',
  filledContent: '#1c2431',
  filledBottom: '#131a26',
  filledOppo: '#1e2735',
  feedbackAccent: '#60a5fa14',
} satisfies PaletteBackedThemeVars

/* ==========================================================================
 * 色板与原生色派生
 * ========================================================================== */

const sharedNonCssColors = {
  resourceCyan: '#0891b2',
  resourceTeal: '#0d9488',
  info: '#2563eb',
  markerSelected: '#ff5c3c',
  scanDark: '#08130e',
  lowBattery: '#9a3412',
} as const

function defineTheme(
  themeVars: PaletteBackedThemeVars,
  options: { surface?: string; navigationBarFront?: NativeThemeColors['navigationBarFront'] } = {}
): AppThemeDefinition {
  const palette: ThemePalette = {
    primary: themeVars.primary6,
    brand: themeVars.primary5,
    ...sharedNonCssColors,
    ink: themeVars.textMain,
    body: themeVars.textSecondary,
    muted: themeVars.textAuxiliary,
    page: themeVars.filledBottom,
    surface: options.surface ?? themeVars.filledContent,
    card: themeVars.filledOppo,
    border: themeVars.borderMain,
    warning: themeVars.warningMain,
    danger: themeVars.dangerMain,
    lowBatteryBg: themeVars.warningSurface,
  }

  return {
    themeVars,
    palette,
    native: {
      pageBackground: palette.page,
      navigationBarBackground: palette.page,
      navigationBarFront: options.navigationBarFront ?? '#000000',
    },
  }
}

/**
 * 应用主题的唯一数据源：按「预设（色相）× 模式（深浅）」给出完整定义。
 * 新增或修改主题时只编辑本文件，禁止再创建平行的 SCSS 色板。
 * 深浅切换由 App.ku.vue 消费（ConfigProvider theme + theme-vars + 原生色同步），
 * 非 CSS 场景（地图/Canvas）经 useThemeColors 消费。
 */
export const lightThemePresets: Record<ThemePreset, AppThemeDefinition> = {
  'brand-green': defineTheme(brandGreenThemeVars),
  contrast: defineTheme(contrastThemeVars, { surface: '#eef2ff' }),
}

export const darkThemePresets: Record<ThemePreset, AppThemeDefinition> = {
  'brand-green': defineTheme(brandGreenDarkThemeVars, { navigationBarFront: '#ffffff' }),
  contrast: defineTheme(contrastDarkThemeVars, {
    surface: '#182130',
    navigationBarFront: '#ffffff',
  }),
}

export function getThemeDefinition(preset: ThemePreset, mode: ThemeMode = 'light'): AppThemeDefinition {
  const bank = mode === 'dark' ? darkThemePresets : lightThemePresets
  return bank[preset] ?? bank[DEFAULT_THEME_PRESET]
}
