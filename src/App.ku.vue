<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { getThemeDefinition } from '@/themes/presets'

/**
 * @uni-ku/root 虚拟根组件：自动包裹每个页面。
 * 这里挂全局 wd-config-provider（驱动浅/深模式、业务主题 token 与组件上下文）。
 * 主题唯一数据源为 src/themes/presets.ts，按「预设 × 深浅」二维取值；
 * 模式/预设变化时同步原生窗口底色与导航栏色（pages.json 静态色不跟随运行时主题）。
 */
const { mode, preset } = storeToRefs(useThemeStore())
const activeTheme = computed(() => getThemeDefinition(preset.value, mode.value))

function syncNativeTheme() {
  const { native } = activeTheme.value
  if (typeof uni.setBackgroundColor === 'function') {
    uni.setBackgroundColor({
      backgroundColor: native.pageBackground,
      backgroundColorTop: native.pageBackground,
      backgroundColorBottom: native.pageBackground,
      fail: () => {},
    })
  }
  if (typeof uni.setNavigationBarColor === 'function') {
    uni.setNavigationBarColor({
      frontColor: native.navigationBarFront,
      backgroundColor: native.navigationBarBackground,
      fail: () => {},
    })
  }
}

onMounted(syncNativeTheme)
watch(activeTheme, syncNativeTheme)
</script>

<template>
  <wd-config-provider :theme="mode" :theme-vars="activeTheme.themeVars">
    <view class="app-root">
      <KuRootView />
    </view>
  </wd-config-provider>
</template>

<style lang="scss">
.app-root {
  min-height: 100vh;
  background-color: var(--wot-filled-bottom);
}
</style>
