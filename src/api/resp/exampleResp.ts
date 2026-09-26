/** 示例接口响应体（src/api/resp/ 存放各领域响应体类型，T = Result 信封的 data 字段） */

/** 登录响应：请求层解包后的 data（金额单位「分」等跨端约定见架构文档 §请求层） */
export interface ExampleLoginRes {
  userToken: string
  userId: number
  phone: string
  nickname: string
  realNameVerified: boolean
  /** normal / frozen / cancelled */
  status: string
}

/** 示例订单 */
export interface ExampleOrder {
  id: number
  orderNo: string
  /** 状态码（src/enums ExampleOrderStatus） */
  status: number
  /** 金额，单位：分 */
  amount: number
  createdAt: string
}

/** 示例订单分页响应 */
export interface ExampleOrderPageRes {
  records: ExampleOrder[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
