import { describe, expect, it, vi } from 'vitest'
import { usePagedList, type PagedResult } from '@/composables/usePagedList'

interface Row {
  id: number
}

function waitFor(predicate: () => boolean) {
  return vi.waitFor(() => {
    if (!predicate()) {
      throw new Error('condition not met')
    }
  })
}

describe('usePagedList（分页状态机）', () => {
  it('refresh 拉首页并更新 hasMore', async () => {
    const fetchPage = vi.fn<(page: { limit: number; offset: number }) => Promise<PagedResult<Row>>>().mockResolvedValue({ items: [{ id: 1 }], hasMore: true })
    const { items, loading, hasMore, refresh } = usePagedList<Row>({ fetchPage, pageSize: 2 })

    refresh()
    expect(loading.value).toBe(true)
    await waitFor(() => !loading.value)

    expect(fetchPage).toHaveBeenCalledWith({ limit: 2, offset: 0 })
    expect(items.value).toEqual([{ id: 1 }])
    expect(hasMore.value).toBe(true)
  })

  it('loadMore 追加下一页', async () => {
    const fetchPage = vi
      .fn<(page: { limit: number; offset: number }) => Promise<PagedResult<Row>>>()
      .mockResolvedValueOnce({ items: [{ id: 1 }, { id: 2 }], hasMore: true })
      .mockResolvedValueOnce({ items: [{ id: 3 }], hasMore: false })
    const { items, loadingMore, hasMore, refresh, loadMore } = usePagedList<Row>({ fetchPage, pageSize: 2 })

    refresh()
    await waitFor(() => !loadingMore.value && items.value.length === 2)
    loadMore()
    await waitFor(() => !loadingMore.value && items.value.length === 3)

    expect(fetchPage).toHaveBeenLastCalledWith({ limit: 2, offset: 2 })
    expect(items.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(hasMore.value).toBe(false)
  })

  it('无更多时 loadMore 不发起请求', async () => {
    const fetchPage = vi.fn<(page: { limit: number; offset: number }) => Promise<PagedResult<Row>>>().mockResolvedValue({ items: [], hasMore: false })
    const { hasMore, refresh, loadMore } = usePagedList<Row>({ fetchPage, pageSize: 2 })

    refresh()
    await waitFor(() => !hasMore.value)
    loadMore()

    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('失败回调带 mode，loading 复位，不吞掉状态', async () => {
    const onError = vi.fn()
    const fetchPage = vi.fn<(page: { limit: number; offset: number }) => Promise<PagedResult<Row>>>().mockRejectedValue(new Error('网络错误'))
    const { loading, refresh } = usePagedList<Row>({ fetchPage, onError })

    refresh()
    await waitFor(() => onError.mock.calls.length > 0)

    expect(onError).toHaveBeenCalledWith(expect.any(Error), 'refresh')
    expect(loading.value).toBe(false)
  })
})
