<script setup lang="ts">
/**
 * 表单示例 —— 骨架推荐的标准表单页写法：
 * - 受控输入 + 提交前本地校验（错误文案逐字段展示）；
 * - useApi 托管提交 loading 与失败兜底 toast；
 * - 成功后 toast 回执 + 返回上一页。
 * 提交到 mock 接口，接入真实后端后仅需替换 api 函数。
 */
import { computed, ref } from 'vue'
import { useToast } from '@wot-ui/ui'
import { submitExampleForm } from '@/api/example'
import { useAppI18n } from '@/composables/useAppI18n'
import { useApi } from '@/composables/useApi'
import { ExampleIssueTypeLabel } from '@/enums'

const { t } = useAppI18n()
const toast = useToast('example-form-toast')
const { loading: submitting, run } = useApi({ fallbackMessage: t('common.submitFailed') })

const orderNo = ref('')
const issueType = ref<number | null>(null)
const remark = ref('')
const fieldErrors = ref<{ orderNo?: string; issueType?: string; remark?: string }>({})

const issueColumns = computed(() =>
  Object.entries(ExampleIssueTypeLabel).map(([value, label]) => ({
    value: Number(value),
    label,
  }))
)

const issueTypeModel = computed<number | undefined>({
  get: () => issueType.value ?? undefined,
  set: (value) => {
    issueType.value = typeof value === 'number' ? value : null
  },
})

function validate(): boolean {
  const errors: { orderNo?: string; issueType?: string; remark?: string } = {}
  if (!orderNo.value.trim()) {
    errors.orderNo = t('form.validation.orderNoRequired')
  }
  if (issueType.value == null) {
    errors.issueType = t('form.validation.issueTypeRequired')
  }
  if (remark.value.length > 200) {
    errors.remark = t('form.validation.remarkMax')
  }
  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function onSubmit() {
  if (submitting.value || !validate()) return

  try {
    await run(() =>
      submitExampleForm({
        orderNo: orderNo.value.trim(),
        issueType: issueType.value!,
        remark: remark.value.trim() || undefined,
      })
    )
    toast.success(t('form.toast.submitted'))
    setTimeout(() => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/index/index' }) }), 600)
  } catch {
    // 失败已由 useApi 统一 toast；业务码分支在此处理
  }
}
</script>

<template>
  <view class="form-page">
    <wd-toast selector="example-form-toast" />

    <view class="card">
      <!-- 订单号 -->
      <view class="field">
        <text class="field-label wot-text-main">{{ t('form.orderNo') }}</text>
        <wd-input
          v-model="orderNo"
          :placeholder="t('form.orderNoPlaceholder')"
          clearable
          no-border
          custom-class="field-input"
        />
        <text v-if="fieldErrors.orderNo" class="field-error">{{ fieldErrors.orderNo }}</text>
      </view>

      <!-- 问题类型 -->
      <view class="field">
        <text class="field-label wot-text-main">{{ t('form.issueType') }}</text>
        <wd-select-picker
          v-model="issueTypeModel"
          :columns="issueColumns"
          type="radio"
          :show-confirm="false"
          :title="t('form.issueTypePlaceholder')"
          label=""
          :placeholder="t('form.issueTypePlaceholder')"
          custom-class="field-select"
        />
        <text v-if="fieldErrors.issueType" class="field-error">{{ fieldErrors.issueType }}</text>
      </view>

      <!-- 备注 -->
      <view class="field">
        <text class="field-label wot-text-main">{{ t('form.remark') }}</text>
        <wd-textarea
          v-model="remark"
          :placeholder="t('form.remarkPlaceholder')"
          :maxlength="200"
          clearable
          custom-class="field-textarea"
        />
        <text v-if="fieldErrors.remark" class="field-error">{{ fieldErrors.remark }}</text>
      </view>

      <wd-button block :loading="submitting" @click="onSubmit">
        {{ submitting ? t('form.submitting') : t('form.submit') }}
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.form-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background-color: var(--wot-filled-bottom);
}

.card {
  padding: 32rpx;
  border-radius: 24rpx;
  background-color: var(--wot-filled-oppo);
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 500;
}

.field-input {
  background-color: var(--wot-filled-content);
  border-radius: 16rpx;
  padding: 8rpx 16rpx;
}

.field-textarea {
  background-color: var(--wot-filled-content);
  border-radius: 16rpx;
  padding: 16rpx;
}

.field-select {
  background-color: var(--wot-filled-content);
  border-radius: 16rpx;
}

.field-error {
  font-size: 22rpx;
  color: var(--wot-danger-main);
}
</style>
