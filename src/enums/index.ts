/**
 * 业务枚举 —— 与后端枚举 1:1 对应（值 = 接口传输码 = 数据库列值）。
 *
 * 约定（详见 docs/frontend-architecture.md）：
 * - 比较一律用这里的命名常量，禁止裸数字（同名常量在不同枚举里码值不同）；
 * - 每个枚举配一个 Label 映射（= 后端 desc），供状态标签等展示场景兜底；
 * - 页面 i18n 文案与 Label 并存时，展示优先 i18n，Label 作兜底。
 */

/** 示例订单状态（ExampleOrderStatus） */
export const ExampleOrderStatus = {
  PENDING: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
} as const
export type ExampleOrderStatusValue = (typeof ExampleOrderStatus)[keyof typeof ExampleOrderStatus]

/** 订单状态展示文案（= 后端 desc） */
export const ExampleOrderStatusLabel: Record<number, string> = {
  [ExampleOrderStatus.PENDING]: '待处理',
  [ExampleOrderStatus.PROCESSING]: '处理中',
  [ExampleOrderStatus.SHIPPED]: '已发货',
  [ExampleOrderStatus.COMPLETED]: '已完成',
  [ExampleOrderStatus.CANCELLED]: '已取消',
}

/** 示例问题类型（ExampleIssueType，表单示例的 picker 选项） */
export const ExampleIssueType = {
  QUALITY: 1,
  LOGISTICS: 2,
  AFTER_SALE: 3,
  OTHER: 4,
} as const

export const ExampleIssueTypeLabel: Record<number, string> = {
  [ExampleIssueType.QUALITY]: '质量问题',
  [ExampleIssueType.LOGISTICS]: '物流问题',
  [ExampleIssueType.AFTER_SALE]: '售后问题',
  [ExampleIssueType.OTHER]: '其他',
}
