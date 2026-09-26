<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useLocaleStore } from '@/stores/locale'

onLaunch(() => {
  // 把持久化的语言同步到 vue-i18n 与 wot-ui Locale
  useLocaleStore().init()
})
onShow(() => {})
onHide(() => {})
</script>

<style lang="scss">
/* Wot UI 基线 token（base + light + dark），业务主题由 App.ku.vue 的 theme-vars 注入。 */
@use '@wot-ui/ui/styles/theme/index.scss' as *;

page {
  background-color: var(--wot-filled-bottom);
}
</style>
