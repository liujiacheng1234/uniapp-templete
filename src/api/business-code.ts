/**
 * 业务码（模板占位版）。
 *
 * 接入真实后端后，用生成脚本整体替换本文件（保持生成格式，勿手改）：
 *   1. 在 scripts/gen-business-code.mjs 顶部或用 --backend 指定后端仓库路径；
 *   2. 运行 `npm run gen:business-code`。
 *
 * 使用约定（详见 docs/frontend-architecture.md §请求层）：
 * 1. 命名与码值同后端 1:1，不在此文件做任何改名或筛选（生成版）；
 * 2. 页面只分支处理关心的码值，其余失败统一交请求层透传；
 * 3. 禁止用 msg 文案做业务判断，一律比对码值常量。
 *
 * 下方为请求层运行所需的最小集合（占位值与参考后端一致）。
 */

export const CommonCode = {
  /** 成功 */
  SUCCESS: 200,
  /** 服务器异常（请求层会统一 toast 兜底） */
  INTERNAL_ERROR: 100999,
} as const

export const UserCode = {
  /** 未登录或登录信息已失效（请求层：静默重登 → 失败跳登录页） */
  UNAUTHORIZED: 200001,
  /** 无权访问 */
  FORBIDDEN: 200002,
  /** 用户未注册（请求层：清理本地态并跳登录页） */
  USER_NOT_REGISTERED: 200003,
  /** Session 已过期（请求层：静默重登 → 失败跳登录页） */
  SESSION_EXPIRED: 200004,
} as const
