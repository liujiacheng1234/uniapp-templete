<script setup lang="ts">
/**
 * 通用设置 —— 骨架自带功能页：主题预设 × 深浅模式 × 语言。
 * 三个开关的数据源分别是 theme store（persist preset+mode）与 locale store（persist locale）。
 */
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useAppI18n } from '@/composables/useAppI18n'
import { APP_LOCALE_KEYS, type AppLocale } from '@/locales'
import { useLocaleStore } from '@/stores/locale'
import { useTheme } from '@/composables/useTheme'
import { THEME_PRESET_KEYS, type ThemePreset } from '@/themes/presets'

const { t } = useAppI18n()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { preset, mode, setPreset, setMode } = useTheme()

const themePickerVisible = ref(false)
const languagePickerVisible = ref(false)

const cardCustomStyle =
  '--wot-cell-group-insert-radius: 32rpx; --wot-cell-group-insert-margin: 0 24rpx; border-style: solid; box-shadow: 0 16rpx 48rpx var(--wot-divider-light);'
// 单元格排版：标题/描述/值形成 30/24/26rpx 层级；
// 不设 title-width（左右栏默认均分），desc 允许自然换行，避免小字号硬挤压。
const cellCustomStyle =
  '--wot-cell-padding: 28rpx; --wot-cell-title-font-size: 30rpx; --wot-cell-title-line-height: 42rpx; --wot-cell-label-font-size: 24rpx; --wot-cell-label-line-height: 34rpx; --wot-cell-value-font-size: 26rpx;'

const themeColumns = computed(() =>
  THEME_PRESET_KEYS.map((value) => ({
    value,
    label: t(`theme.preset.${value}`),
  }))
)

const languageColumns = computed(() =>
  APP_LOCALE_KEYS.map((value) => ({
    value,
    label: t(`settings.language.options.${value === 'zh-CN' ? 'zhCN' : 'en'}`),
  }))
)

const selectedPreset = computed<string>({
  get: () => preset.value,
  set: (value) => {
    if (THEME_PRESET_KEYS.includes(value as ThemePreset)) {
      setPreset(value as ThemePreset)
    }
  },
})

const selectedLocale = computed<string>({
  get: () => locale.value,
  set: (value) => {
    if (APP_LOCALE_KEYS.includes(value as AppLocale)) {
      localeStore.setLocale(value as AppLocale)
    }
  },
})

const currentThemeLabel = computed(() => t(`theme.preset.${preset.value}`))
const currentLanguageLabel = computed(() =>
  t(`settings.language.options.${locale.value === 'zh-CN' ? 'zhCN' : 'en'}`)
)
const isDarkMode = computed(() => mode.value === 'dark')
const currentModeLabel = computed(() => t(`theme.mode.${mode.value}`))

function onModeChange({ value }: { value: boolean | string | number }) {
  setMode(value ? 'dark' : 'light')
}

function applyNavTitle() {
  uni.setNavigationBarTitle({ title: t('settings.navTitle') })
}

watch(() => localeStore.locale, applyNavTitle)

onShow(applyNavTitle)
</script>

<template>
  <view class="settings">
    <view class="settings-intro">
      <text class="settings-intro-title wot-text-text-main">{{ t('settings.intro.title') }}</text>
      <text class="settings-intro-desc wot-text-text-secondary">
        {{ t('settings.intro.desc') }}
      </text>
    </view>

    <view class="settings-section">
      <wd-cell-group
        :title="t('settings.groupTitle')"
        insert
        border
        custom-class="wot-border-border-light wot-border-stroke-main"
        :custom-style="cardCustomStyle"
      >
        <!-- 主题预设 -->
        <wd-cell
          :title="t('settings.theme.title')"
          :label="t('settings.theme.desc')"
          :value="currentThemeLabel"
          custom-class="settings-cell"
          :custom-style="cellCustomStyle"
          is-link
          center
          @click="themePickerVisible = true"
        >
          <template #prefix>
            <view class="settings-leading-icon">
              <wd-icon name="skin" size="36rpx" />
            </view>
          </template>
        </wd-cell>

        <!-- 深色模式 -->
        <wd-cell
          :title="t('settings.theme.mode')"
          :label="currentModeLabel"
          custom-class="settings-cell"
          :custom-style="cellCustomStyle"
          center
        >
          <template #prefix>
            <view class="settings-leading-icon">
              <wd-icon name="moon" size="36rpx" />
            </view>
          </template>
          <wd-switch :model-value="isDarkMode" @change="onModeChange" />
        </wd-cell>

        <!-- 语言 -->
        <wd-cell
          :title="t('settings.language.title')"
          :label="t('settings.language.desc')"
          :value="currentLanguageLabel"
          custom-class="settings-cell"
          :custom-style="cellCustomStyle"
          is-link
          center
          @click="languagePickerVisible = true"
        >
          <template #prefix>
            <view class="settings-leading-icon">
              <wd-icon name="language" size="36rpx" />
            </view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <view class="settings-notice">
      <wd-notice-bar
        :text="t('settings.notice')"
        prefix="info-circle"
        type="info"
        :scrollable="false"
        wrapable
        color="var(--wot-primary-7)"
        background-color="var(--wot-primary-1)"
      />
    </view>

    <wd-select-picker
      v-model="selectedPreset"
      v-model:visible="themePickerVisible"
      type="radio"
      :show-confirm="false"
      :title="t('settings.theme.pickerTitle')"
      :columns="themeColumns"
    />

    <wd-select-picker
      v-model="selectedLocale"
      v-model:visible="languagePickerVisible"
      type="radio"
      :show-confirm="false"
      :title="t('settings.language.pickerTitle')"
      :columns="languageColumns"
    />
  </view>
</template>

<style lang="scss" scoped>
.settings {
  min-height: 100vh;
  /* 底部预留安全区（iPhone home 指示条），不支持 env() 的端回退到 48rpx */
  padding-bottom: 48rpx;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background-color: var(--wot-filled-bottom);
}

.settings-intro {
  padding: 40rpx 48rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.settings-intro-title {
  font-size: 36rpx;
  font-weight: 600;
}

.settings-intro-desc {
  font-size: 24rpx;
  line-height: 38rpx;
}

.settings-section {
  margin-top: 16rpx;
}

.settings-leading-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  border: 1px solid var(--wot-primary-3);
  background-color: var(--wot-primary-2);
  color: var(--wot-primary-6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* 与标题的间距：prefix 用插槽时不带 .wd-cell__prefix，
     --wot-cell-icon-spacing-right 不会生效，直接在包裹类上给 */
  margin-right: 20rpx;
}

/* 图标与「标题+描述」整块垂直居中（wd-cell__left 默认顶对齐，多行描述时图标会偏上） */
.settings-cell :deep(.wd-cell__left) {
  align-items: center;
}

/* wd-cell 左右栏默认各 flex:1（50/50 均分），而右侧 value 内容很窄，
   白白占掉一半宽度、把左栏 desc 挤到换行。让右侧收缩为内容宽，
   左栏占据剩余全部宽度，desc 保持单行（组件已开 styleIsolation:shared，页面样式可穿透）。 */
.settings-cell :deep(.wd-cell__right) {
  flex: 0 0 auto;
  max-width: 50%;
  padding-left: 24rpx;
}

.settings-notice {
  margin: 32rpx 24rpx 0;
}
</style>
