import type {
  ExampleLoginRes,
  ExampleOrder,
  ExampleOrderPageRes,
} from '@/api/resp/exampleResp'

/**
 * 最小 mock 方案：让 UI 在后端未就绪时先行开发。
 *
 * 用法：
 * 1. `.env.development` 已默认 `VITE_USE_MOCK=true`（个人差异用 .env.development.local 覆盖）；
 * 2. 在 MOCK_ROUTES 增加路由：key = `${method} ${url}`；
 *    - 静态数据：`{ data }`（data = Result 信封的 data 字段，code=200 语义由请求层统一）；
 *    - 需要按请求体动态返回（如分页）：`{ resolve: (data) => ... }`；
 * 3. 未命中的路由仍走真实请求，可按需逐个替换；
 * 4. 仅建议在本地开发使用；构建版误开等于对用户发假数据，务必不要在构建环境开启。
 *
 * 约定：
 * - fixture 字段类型必须对齐 src/api/resp/* 的真实响应类型（用 satisfies 检查）；
 * - 金额单位「分」、状态码值等跨端约定与真实接口完全一致，避免 mock 与真实数据两套口径。
 */

export interface MockRoute {
  /** Result 信封中的 data 字段；可为 null（对应 request<null> 接口） */
  data?: unknown
  /** 按请求体动态计算 data（如分页切片）；与 data 二选一，优先级更高 */
  resolve?: (data: object) => unknown
  /** 模拟网络延迟 ms，默认 300，便于观察 loading 态 */
  delay?: number
}

export const MOCK_DEFAULT_DELAY_MS = 300

/* ---------------- fixture：示例订单（23 条，演示分页与状态标签） ---------------- */

const EXAMPLE_TOTAL = 23

function buildExampleOrders(): ExampleOrder[] {
  return Array.from({ length: EXAMPLE_TOTAL }, (_, index) => {
    const id = index + 1
    return {
      id,
      orderNo: `EX2026${String(831000 + id)}`,
      status: (id % 5) + 1,
      amount: 19900 + id * 137,
      createdAt: `2026-08-${String(31 - (id % 28)).padStart(2, '0')} ${String(id % 24).padStart(2, '0')}:30:00`,
    }
  })
}

const exampleOrders = buildExampleOrders()

const mockLoginRes: ExampleLoginRes = {
  userToken: 'mock-token-0001',
  userId: 10001,
  phone: '138****0000',
  nickname: '模板用户',
  realNameVerified: false,
  status: 'normal',
}

/* ---------------- 路由表 ---------------- */

/**
 * mock 路由表。key = `${method} ${url}`（method 大写；url 与 api/* 里的一致，不含 query）。
 * 接入真实后端后可整体删除或保留（VITE_USE_MOCK=false 时不生效）。
 */
const MOCK_ROUTES: Record<string, MockRoute> = {
  'POST /api/example/login': { data: mockLoginRes, delay: 600 },
  'POST /api/example/orders': {
    resolve: (data) => {
      const { page = 1, pageSize = 10 } = data as { page?: number; pageSize?: number }
      const start = (page - 1) * pageSize
      const records = exampleOrders.slice(start, start + pageSize)
      const result: ExampleOrderPageRes = {
        records,
        total: EXAMPLE_TOTAL,
        page,
        pageSize,
        hasMore: start + records.length < EXAMPLE_TOTAL,
      }
      return result
    },
  },
  'POST /api/example/submit': { data: null, delay: 800 },
}

/** 命中返回路由（含 data/resolve/delay），未命中返回 null；由 request() 统一短路。 */
export function matchMockRoute(method: string | undefined, url: string): MockRoute | null {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return null
  }
  return MOCK_ROUTES[`${(method || 'POST').toUpperCase()} ${url}`] ?? null
}
