<script setup lang="ts">
/**
 * 列表示例 —— 骨架推荐的标准列表页写法：
 * - usePagedList 托管分页状态（loading / loadingMore / hasMore / 触底加载 / 重试）；
 * - useApi 统一错误兜底 toast；
 * - easycom 组件 order-status-tag 展示状态（组件内枚举映射，支持 label 覆盖走 i18n）；
 * - 金额用 yuan()（后端单位「分」）、时间用 formatDateTime()。
 * 数据来自 mock（src/mocks/handlers.ts），接入真实后端后本页无需改动分页逻辑。
 */
import { computed, ref } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { useToast } from '@wot-ui/ui'
import type { ExampleOrder } from '@/api/resp/exampleResp'
import { getExampleOrders } from '@/api/example'
import { useAppI18n } from '@/composables/useAppI18n'
import { getErrorMessage } from '@/composables/useApi'
import { usePagedList } from '@/composables/usePagedList'
import { formatDateTime, yuan } from '@/utils/commonUtil'

const { t } = useAppI18n()
const toast = useToast('example-list-toast')

const loadError = ref(false)
const total = ref(0)

const { items, loading, loadingMore, hasMore, refresh, loadMore } = usePagedList<ExampleOrder>({
  pageSize: 10,
  fetchPage: async ({ limit, offset }) => {
    const page = await getExampleOrders({ page: offset / limit + 1, pageSize: limit })
    total.value = page.total
    return { items: page.records, hasMore: page.hasMore }
  },
  onError: (error, mode) => {
    loadError.value = mode === 'refresh'
    toast.error(
      getErrorMessage(
        error,
        mode === 'refresh' ? t('common.loadFailed') : t('common.loadMoreFailed')
      )
    )
  },
})

const summary = computed(() => t('list.summary', { total: total.value }))

onShow(() => {
  if (items.value.length === 0) {
    refresh()
  }
})

onReachBottom(() => {
  loadMore()
})

function onRetry() {
  loadError.value = false
  refresh()
}
</script>

<template>
  <view class="list-page">
    <wd-toast selector="example-list-toast" />

    <view class="list-summary">
      <text class="wot-text-text-secondary">{{ summary }}</text>
      <text class="wot-text-text-auxiliary list-demo">{{ t('list.demo') }}</text>
    </view>

    <!-- 首屏 loading -->
    <view v-if="loading" class="list-state">
      <wd-loading />
    </view>

    <!-- 首屏失败 -->
    <view v-else-if="loadError" class="list-state">
      <text class="wot-text-text-secondary">{{ t('common.loadFailed') }}</text>
      <wd-button size="small" plain @click="onRetry">{{ t('list.retry') }}</wd-button>
    </view>

    <!-- 空态 -->
    <view v-else-if="items.length === 0" class="list-state">
      <text class="wot-text-text-secondary">{{ t('common.empty') }}</text>
    </view>

    <!-- 列表 -->
    <template v-else>
      <view v-for="order in items" :key="order.id" class="order-card">
        <view class="order-head">
          <text class="order-no wot-text-text-main">{{ order.orderNo }}</text>
          <order-status-tag :status="order.status" />
        </view>
        <view class="order-meta">
          <text class="wot-text-text-secondary">{{ t('list.itemAmount') }}</text>
          <text class="order-amount wot-text-text-main">¥{{ yuan(order.amount).toFixed(2) }}</text>
        </view>
        <text class="order-time wot-text-text-auxiliary">
          {{ formatDateTime(order.createdAt) }}
        </text>
      </view>

      <!-- 加载更多状态 -->
      <view class="list-state list-more">
        <wd-loading v-if="loadingMore" />
        <text v-else-if="!hasMore" class="wot-text-text-auxiliary">{{ t('list.noMore') }}</text>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.list-page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background-color: var(--wot-filled-bottom);
}

.list-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 8rpx 8rpx 20rpx;
  font-size: 24rpx;
}

.list-demo {
  font-size: 20rpx;
}

.order-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background-color: var(--wot-filled-oppo);
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-no {
  font-size: 28rpx;
  font-weight: 600;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
}

.order-amount {
  font-weight: 600;
}

.order-time {
  font-size: 22rpx;
}

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 80rpx 0;
}

.list-more {
  padding: 24rpx 0 48rpx;
}
</style>
