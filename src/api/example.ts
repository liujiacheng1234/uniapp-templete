import { request } from './request'
import type {
  ExampleLoginRes,
  ExampleOrder,
  ExampleOrderPageRes,
} from './resp/exampleResp'
import type {
  ExampleLoginRequest,
  ExampleOrderPageRequest,
  ExampleSubmitRequest,
} from './req/exampleReq'

/**
 * 示例接口（模板演示用，配合 src/mocks/handlers.ts 的 mock 数据开箱即跑）。
 *
 * 这是 api/* 领域模块的标准写法：
 * - 一个业务领域一个文件，函数名即接口语义，入参出参全部显式类型；
 * - 返回 request<T> 的 T = Result 信封 data 字段（信封已由请求层解包）；
 * - 全 POST（与参考后端约定一致），业务 id 放请求体；
 * - userToken 等鉴权头由请求层注入，函数内不关心登录态；
 * - 接入真实后端时：改 URL 前缀与字段，或整体删除本文件按领域新建。
 */

/** 账号密码登录（模板演示；真实项目替换为微信 code 登录等，见 utils/auth.ts configureAuth） */
export function loginByAccount(data: ExampleLoginRequest) {
  return request<ExampleLoginRes>({
    url: '/api/example/login',
    method: 'POST',
    data,
  })
}

/** 分页查询示例订单 */
export function getExampleOrders(params: ExampleOrderPageRequest = {}) {
  return request<ExampleOrderPageRes>({
    url: '/api/example/orders',
    method: 'POST',
    data: params,
  })
}

/** 提交示例表单（data 为 null 的接口写法） */
export function submitExampleForm(data: ExampleSubmitRequest) {
  return request<null>({
    url: '/api/example/submit',
    method: 'POST',
    data,
  })
}

/** 查询单个订单详情（路径参数式 URL 示例） */
export function getExampleOrder(orderId: number) {
  return request<ExampleOrder>({
    url: `/api/example/orders/${orderId}`,
    method: 'POST',
  })
}
