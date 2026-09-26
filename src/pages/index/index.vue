<script setup lang="ts">
/**
 * 首页 —— 骨架导览。
 *
 * 演示：useAppI18n 文案、主题 token 消费（var(--wot-*)）、useThemeColors 非场景取色、
 * easycom 组件（wd-button / wd-cell-group）。页面自身不放业务，接入时整页替换。
 */
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useThemeColors } from '@/composables/useThemeColors'
import { useTheme } from '@/composables/useTheme'

const { t } = useAppI18n()
const { palette } = useThemeColors()
const { preset, mode } = useTheme()

const cards = computed(() => [
  {
    key: 'arch',
    title: t('index.cards.arch.title'),
    desc: t('index.cards.arch.desc'),
    url: '',
  },
  {
    key: 'list',
    title: t('index.cards.list.title'),
    desc: t('index.cards.list.desc'),
    url: '/pages/examples/list/list',
  },
  {
    key: 'form',
    title: t('index.cards.form.title'),
    desc: t('index.cards.form.desc'),
    url: '/pages/examples/form/form',
  },
  {
    key: 'login',
    title: t('index.cards.login.title'),
    desc: t('index.cards.login.desc'),
    url: '/pages/login/login',
  },
  {
    key: 'settings',
    title: t('index.cards.settings.title'),
    desc: t('index.cards.settings.desc'),
    url: '/pages/settings/settings',
  },
])

const swatches = computed(() => [
  { label: 'primary', value: palette.value.primary },
  { label: 'brand', value: palette.value.brand },
  { label: 'surface', value: palette.value.surface },
  { label: 'card', value: palette.value.card },
  { label: 'border', value: palette.value.border },
])

function open(url: string) {
  if (!url) {
    uni.showToast({ title: 'docs/frontend-architecture.md', icon: 'none' })
    return
  }
  uni.navigateTo({ url })
}

const currentPresetLabel = computed(() => t(`theme.preset.${preset.value}`))
const currentModeLabel = computed(() => t(`theme.mode.${mode.value}`))
</script>

<template>
  <view class="page">
    <!-- Hero -->
    <view class="hero">
      <text class="hero-title wot-text-text-main">{{ t('index.hero.title') }}</text>
      <text class="hero-desc wot-text-text-secondary">{{ t('index.hero.desc') }}</text>
    </view>

    <!-- 主题预览 -->
    <view class="card wot-border-stroke-main">
      <view class="card-head">
        <text class="card-title wot-text-text-main">{{ t('index.themePreview.title') }}</text>
        <text class="card-tag wot-text-text-secondary">
          {{ currentPresetLabel }} · {{ currentModeLabel }}
        </text>
      </view>
      <text class="card-desc wot-text-text-secondary">{{ t('index.themePreview.desc') }}</text>
      <view class="swatches">
        <view v-for="swatch in swatches" :key="swatch.label" class="swatch">
          <view class="swatch-color" :style="{ backgroundColor: swatch.value }" />
          <text class="swatch-label wot-text-text-secondary">{{ swatch.label }}</text>
        </view>
      </view>
    </view>

    <!-- 入口卡片 -->
    <view
      v-for="card in cards"
      :key="card.key"
      class="card wot-border-stroke-main"
      @click="open(card.url)"
    >
      <view class="card-head">
        <text class="card-title wot-text-text-main">{{ card.title }}</text>
        <wd-icon name="arrow-right" size="32rpx" custom-class="wot-text-text-auxiliary" />
      </view>
      <text class="card-desc wot-text-text-secondary">{{ card.desc }}</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 颜色一律消费 --wot-* token（深浅模式自动适配），禁止硬编码色值 */
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background-color: var(--wot-filled-bottom);
}

.hero {
  padding: 40rpx 32rpx;
  border-radius: 32rpx;
  background-color: var(--wot-primary-1);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 600;
}

.hero-desc {
  font-size: 26rpx;
  line-height: 40rpx;
}

.card {
  margin-top: 24rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background-color: var(--wot-filled-oppo);
  border-width: 1px;
  border-style: solid;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
}

.card-tag {
  font-size: 22rpx;
}

.card-desc {
  font-size: 24rpx;
  line-height: 38rpx;
}

.swatches {
  margin-top: 8rpx;
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
}

.swatch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.swatch-color {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  border: 1px solid var(--wot-border-light);
}

.swatch-label {
  font-size: 20rpx;
}
</style>
