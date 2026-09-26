/** 示例接口请求体（src/api/req/ 存放各领域请求体类型，与后端字段一一对应） */

/** 登录请求 */
export interface ExampleLoginRequest {
  username: string
  password: string
}

/** 示例订单分页查询 */
export interface ExampleOrderPageRequest {
  /** 页码，从 1 开始 */
  page?: number
  /** 页大小，默认 10 */
  pageSize?: number
}

/** 示例表单提交 */
export interface ExampleSubmitRequest {
  /** 关联订单号 */
  orderNo: string
  /** 问题类型（见 src/enums ExampleIssueType） */
  issueType: number
  /** 备注说明 */
  remark?: string
}
