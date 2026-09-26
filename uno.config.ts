import { presetWot } from '@wot-ui/unocss-preset'
import { defineConfig } from 'unocss'

/**
 * UnoCSS 配置：唯一预设为 @wot-ui/unocss-preset（presetWot）。
 * 它提供 wot- 前缀原子类（wot-text-main / wot-bg-filled-oppo / wot-p-main ...），
 * 内部消费 --wot-* 语义 token，深浅模式自动适配，并注入 wot-ui 基础 CSS 变量 preflights。
 *
 * 颜色纪律见 docs/frontend-architecture.md §7.2：
 * 页面/组件样式禁止硬编码色值；CSS 变量覆盖不到的场景用 useThemeColors()，
 * 新增/调整品牌色只改 src/themes/presets.ts，勿在此自定义色值规则。
 */
export default defineConfig({
  presets: [presetWot()],
})
