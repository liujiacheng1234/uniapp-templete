<script setup lang="ts">
/**
 * 订单状态标签 —— src/components 下的复用组件示例（easycom 自动注册）。
 *
 * 目录约定：components/组件名/组件名.vue（pages.json easycom.autoscan 已开启），
 * 任意页面直接写 <order-status-tag :status="order.status" />，无需 import。
 * 注意：选择器 / 组件 id 必须是 ASCII（中文类名会导致微信 WXSS 编译失败）。
 */
import { computed } from 'vue'
import { ExampleOrderStatus, ExampleOrderStatusLabel } from '@/enums'

type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger'

const props = defineProps<{
  /** 订单状态码（ExampleOrderStatus） */
  status: number
  /** 覆盖默认文案（如 i18n 场景传 t(...)），缺省用 ExampleOrderStatusLabel */
  label?: string
}>()

const meta = computed<{ label: string; type: TagType }>(() => {
  const label = props.label ?? ExampleOrderStatusLabel[props.status] ?? '未知状态'
  if (props.status === ExampleOrderStatus.COMPLETED) {
    return { label, type: 'success' }
  }
  if (props.status === ExampleOrderStatus.CANCELLED) {
    return { label, type: 'default' }
  }
  if (props.status === ExampleOrderStatus.PROCESSING || props.status === ExampleOrderStatus.SHIPPED) {
    return { label, type: 'warning' }
  }
  // 待处理
  return { label, type: 'primary' }
})
</script>

<template>
  <wd-tag :type="meta.type" custom-class="order-status-tag">
    {{ meta.label }}
  </wd-tag>
</template>

<style lang="scss" scoped>
.order-status-tag {
  vertical-align: middle;
}
</style>
