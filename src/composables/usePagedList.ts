import { ref, shallowRef } from 'vue'

/**
 * 分页列表通用状态机（对齐 useNearbyMerchants 的既有模式）：
 * loading / loadingMore / hasMore / loadMore / refresh，内置过期响应丢弃（并发竞态防护）。
 *
 * ```ts
 * const { items, loading, loadingMore, hasMore, refresh, loadMore } = usePagedList<WalletTransaction>({
 *   pageSize: 10,
 *   fetchPage: async ({ limit, offset }) => {
 *     // 后端若是 current/size + records 分页（如 /api/wallet/bills），在这里做一次形状转换：
 *     const page = await getWalletBills({ current: offset / limit + 1, size: limit })
 *     const records = page.records ?? []
 *     return { items: records, hasMore: Boolean(page.current && page.pages && page.current < page.pages) }
 *   },
 *   onError: (error, mode) => toast.error(getErrorMessage(error, mode === 'refresh' ? '加载失败' : '加载更多失败')),
 * })
 * // 首屏：refresh()；触底/加载更多按钮：loadMore()
 * ```
 *
 * 注意：不自动发起首屏请求，由调用方在 onShow / onLoad 里决定（配合下拉刷新或 retry）。
 */

/** 统一的分页结果形状：调用方在 fetchPage 里把各种后端分页协议转换成它 */
export interface PagedResult<T> {
  items: T[]
  hasMore: boolean
}

export interface UsePagedListOptions<T> {
  /** 拉取一页；page.offset 为已加载条数、page.limit 为页大小 */
  fetchPage: (page: { limit: number; offset: number }) => Promise<PagedResult<T>>
  /** 页大小，默认 10 */
  pageSize?: number
  /** 失败回调（useApi/useToast 由调用方决定）；mode 区分首屏与加载更多 */
  onError?: (error: unknown, mode: 'refresh' | 'more') => void
}

export function usePagedList<T>(options: UsePagedListOptions<T>) {
  const pageSize = options.pageSize ?? 10

  // shallowRef：列表始终整体替换（见 loadPage），避免深层 ref 对泛型 T 的解包类型问题
  const items = shallowRef<T[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(false)

  /** 递增代号：refresh/中心变化会使在途请求失效，过期响应直接丢弃 */
  let generation = 0
  let offset = 0

  async function loadPage(nextOffset: number, mode: 'refresh' | 'more') {
    const requestId = ++generation
    if (mode === 'more') {
      loadingMore.value = true
    } else {
      loading.value = true
    }
    try {
      const result = await options.fetchPage({ limit: pageSize, offset: nextOffset })
      if (requestId !== generation) return
      offset = nextOffset
      hasMore.value = Boolean(result.hasMore)
      items.value = mode === 'more' ? items.value.concat(result.items) : result.items
    } catch (error) {
      if (requestId !== generation) return
      options.onError?.(error, mode)
    } finally {
      if (requestId === generation) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  /** 首屏 / 下拉刷新：回到第一页并清空列表 */
  function refresh() {
    if (loading.value) return
    void loadPage(0, 'refresh')
  }

  /** 加载下一页（触底或按钮）；刷新中 / 加载中 / 无更多时为空操作 */
  function loadMore() {
    if (!hasMore.value || loading.value || loadingMore.value) return
    void loadPage(offset + pageSize, 'more')
  }

  return { items, loading, loadingMore, hasMore, refresh, loadMore }
}
