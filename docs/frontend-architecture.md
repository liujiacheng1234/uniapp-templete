# 前端架构文档

> **文档效力**：本模板的所有项目（下称「项目」）的前端开发必须遵循本文档。评审/合并代码时以本文为依据；需要变更架构约定时，先改本文档、再改代码（文档与实现不一致视为 bug）。
>
> 技术疑问优先查本文与代码内注释；本文未覆盖的场景，选择「与最接近的既有实现保持一致」，并在 PR 中补充文档。

---

## 1. 技术栈基线

| 层 | 选型 | 版本基线 |
|----|------|----------|
| 框架 | uni-app（Vue 3 组合式 API） | 3.0.0-5000720260410001 |
| 语言 | TypeScript（strict） | ^5.4 |
| 状态 | Pinia + pinia-plugin-persistedstate | 2.x / 3.x |
| 组件库 | wot-ui v2（easycom 按需引入） | ^2.2 |
| 原子样式 | UnoCSS + @wot-ui/unocss-preset | — |
| 国际化 | vue-i18n（runtime-only 模式） | 9.x |
| 虚拟根组件 | @uni-ku/root（App.ku.vue） | ^1.5 |
| 测试 | Vitest（纯逻辑层单测） | ^3（勿升 4，需 vite 6+） |
| 包管理 | **npm（唯一）** | node ≥ 18 |

包管理器铁律：**只使用 npm**（锁文件仅 `package-lock.json`），不引入 pnpm/yarn。

## 2. 目录结构即架构

```
src/
├─ api/               # 接口层：一个业务领域一个文件
│  ├─ request.ts      #   唯一的请求出口（信封解包/鉴权/重登/mock 短路），禁止修改其协议语义
│  ├─ business-code.ts#   业务码（由 scripts/gen-business-code.mjs 生成，禁止手改）
│  ├─ req/ resp/      #   请求体 / 响应体类型，与后端字段一一对应
│  └─ <domain>.ts     #   领域接口函数（login/orders/...）
├─ composables/       # 全局组合式（跨页面复用才准入）
├─ components/        # 全局组件（easycom：<name>/<name>.vue，自动注册）
├─ enums/             # 业务枚举（与后端枚举 1:1，附 Label 映射）
├─ locales/           # i18n 语言包（zh-CN 与 en 成对，一个页面一个命名空间）
├─ mocks/             # mock 路由表（VITE_USE_MOCK=true 时生效）
├─ pages/             # 页面（一个页面一个目录，目录名 = 页面名）
│  └─ <page>/
│     ├─ <page>.vue
│     └─ composables/ #   页面私有组合式（只服务本页，禁止被跨页引用）
├─ static/            # 静态资源（编译进包，控制体积）
├─ stores/            # Pinia store（跨页面共享的登录态之外的少量全局状态）
├─ themes/            # 主题唯一数据源 presets.ts（预设 × 深浅）
├─ utils/             # 纯函数工具（无 Vue/uni 耦合）+ 登录态快照 auth.ts
├─ App.vue            # 全局样式入口（page 底色消费 token）
├─ App.ku.vue         # 虚拟根组件：全局 ConfigProvider + 原生色同步
├─ main.ts            # 应用入口（注册 pinia/i18n/configureAuth）
├─ manifest.json      # appid 等平台配置
└─ pages.json         # 页面注册（颜色约定见文件头注释）
```

**准入规则**：
- 想往 `composables/`、`components/` 放东西：先确认 ≥ 2 个页面要用，否则放页面私有目录；
- 想往 `utils/` 放东西：必须是纯函数（不碰 `uni.` / Vue 响应式）；
- 禁止新建 `src/services/`、`src/helpers/` 等平行目录。

## 3. 分层架构与依赖方向

```
pages（页面）
  ↓ 调用
composables（useApi / usePagedList / 页面私有组合式）
  ↓ 调用
api/<domain>.ts（接口函数：URL + 类型 + request 调用）
  ↓ 唯一出口
api/request.ts（协议、鉴权、重试、mock 短路）
  ↓
uni.request / mocks
```

**红线**：
1. 页面/组合式 **禁止直接调用 `uni.request`**，一切请求走 `api/`；
2. `api/` 禁止 import 页面与组件（不允许反向依赖）；
3. `utils/` 保持纯函数；`auth.ts` 是唯一例外（会话快照 + 登录执行器注入）；
4. 跨层传递只允许显式参数与返回值，禁止用全局事件总线隐式通信。

## 4. 请求层规范（最重要的一章）

### 4.1 协议约定

- 后端所有接口 **HTTP 200 + Result 信封**：`{ code, msg, data }`；
- `request<T>()` 已在请求层解包：**T 直接就是后端 `data` 的类型**，`code/msg` 仅在失败时随 `RequestError` 抛出；
- HTTP ≥ 500 / 协议异常 → 请求层统一 toast 兜底并 reject（`RequestError.statusCode` / `detail` 可查）；
- 超时 15s（`REQUEST_TIMEOUT_MS`），超时走 fail 分支转为网络错误。

### 4.2 接口函数标准写法

```ts
// src/api/example.ts
/** 分页查询示例订单 */
export function getExampleOrders(params: ExampleOrderPageRequest = {}) {
  return request<ExampleOrderPageRes>({
    url: '/api/example/orders',
    method: 'POST',
    data: params,
  })
}
```

- 全 POST、业务 id 放请求体（与参考后端约定一致；接入其他风格后端时可调整，但**一个项目内必须统一**）；
- 请求体类型放 `api/req/`，响应类型放 `api/resp/`，字段与后端一一对应并写注释（尤其金额单位「分」、状态码值）。

### 4.3 业务码铁律

- 业务码常量全部来自 `api/business-code.ts`（生成物，后端枚举 1:1）；
- **禁止用 `msg` 文案做任何业务判断**（文案会改，码值是契约）；
- 只分支处理业务关心的码值，其余失败交给请求层透传 + `useApi` 兜底 toast；
- 后端枚举变更后必须执行 `npm run gen:business-code` 同步（后端路径见脚本头部）。

### 4.4 登录态与静默重登

- token 存于本地登录态快照（`utils/auth.ts`，storage key `lease_auth_session`），请求层每次请求实时读取注入 `userToken` 头；
- 收到 `UserCode.UNAUTHORIZED / SESSION_EXPIRED`：请求层调用 `configureAuth` 注入的登录执行器**静默重登一次并重放请求**（`loginPromise` 并发去重；重登仍失败 → 清登录态 reLaunch `/pages/login/login`）；
- 匿名接口显式传 `auth: false`；
- 接入真实项目只需在 `main.ts` 替换 `configureAuth(...)` 的执行器实现。

### 4.5 页面调用范式：useApi（标准写法，全项目统一）

```ts
const toast = useToast('trip-list-toast')
const { loading, run } = useApi({ fallbackMessage: t('tripList.toast.loadFailed') })

async function loadFirst() {
  try {
    const page = await run(() => getExampleOrders(query))
    // ... 处理数据
  } catch (error) {
    // 失败已由 run 自动 toast（error.message 优先，为空用 fallbackMessage）；
    // 需要按业务码分支时在这里处理，不要再重复 toast
    if (isRequestError(error) && error.code === XxxCode.YYY) { /* ... */ }
  }
}
```

**反例（禁止）**：手写 `loading.value = true / finally 置回`、手写 `getErrorMessage`、catch 里再 toast 一次。
（列表页例外：分页状态由 `usePagedList` 托管，错误经其 `onError` 回调 + `getErrorMessage` 处理，见示例页。）

## 5. Mock 规范

- `.env.development` 默认 `VITE_USE_MOCK=true`：命中 `src/mocks/handlers.ts` 路由的请求直接返回 fixture，**未命中仍走真实请求**（可逐个替换）；
- 静态数据用 `{ data }`；需按请求体动态返回（分页）用 `{ resolve: (data) => ... }`；
- fixture 类型必须 `satisfies` 对齐 `api/resp/*`；金额「分」、码值等约定与真实接口完全一致；
- **构建版禁止开启**（`.env.production*` 不写该变量）；接入后端后可整体删除 mocks。

## 6. 状态管理规范

- 只有**跨页面**的全局状态才进 Pinia（模板自带：`theme`、`locale`）；页面状态一律页面内 `ref`；
- 需要持久化的 store 用 `persist: { storage: uniStorage, paths: [...] }`，**必须显式列 paths**（默认全量持久化会把临时态写进 storage）；
- 登录态**不走 Pinia**：它由 `utils/auth.ts` 的 storage 快照管理（请求层需同步读取 token），页面要展示时在 onShow 里读取快照。

## 7. 主题体系

### 7.1 二维主题

- **预设（ThemePreset）**= 色相：`brand-green` / `contrast`，`themes/presets.ts` 唯一数据源；
- **模式（ThemeMode）**= 深浅：`light` / `dark`，均已完整接线（组件库 token + 业务 token + palette + 原生导航色）；
- 取值唯一入口：`getThemeDefinition(preset, mode)`；非 CSS 场景（地图/Canvas/showModal 颜色）用 `useThemeColors()`。

### 7.2 颜色纪律（最强约定）

1. 页面/组件样式**禁止硬编码色值**，一律消费 `var(--wot-*)` 语义 token（如 `--wot-text-main`、`--wot-filled-oppo`），深浅模式自动适配；
2. 无法用 CSS 变量的场景（map marker、Canvas、`uni.showModal.confirmColor`、内联 `color=""`）用 `useThemeColors().palette`；
3. 新增/调整品牌色**只改 `themes/presets.ts`**，禁止平行 SCSS 色板；
4. `pages.json` 的静态色只决定首帧，不跟随主题切换（已知限制）；新增页面只写 `navigationBarTitleText`，颜色继承 globalStyle。

### 7.3 深色适配 checklist（新页面必查）

- [ ] 无硬编码 hex / rgb 色值
- [ ] 深底上的卡片用 `--wot-filled-oppo`、分区用 `--wot-filled-content`、页面底 `--wot-filled-bottom`
- [ ] 文字用 `--wot-text-main/secondary/auxiliary`，禁用半透明黑（`rgba(0,0,0,.x)` 在暗色下不可见，用 `--wot-divider-*`）
- [ ] Canvas/地图等取色来自 `useThemeColors()`（响应式）

## 8. i18n 规范

- 一个页面/领域一个命名空间：`locales/zh-CN/<ns>.json` 与 `en` **成对新增** → `locales/<lang>/index.ts` 注册 → 页面 `t('<ns>.key')`；
- `fallbackLocale: 'zh-CN'`（缺 key 回退中文，不会露出英文）；文案参数用 `{name}` 占位：`t('x.hi', { name })`；
- 用户可见文案禁止硬编码在模板里（枚举 Label 属后端 desc 口径，允许作展示兜底）；
- 页面标题需在 `onShow` 里 `uni.setNavigationBarTitle` 跟随语言（参考 settings 页）。

## 9. 组件规范

- 全局组件放 `src/components/<name>/<name>.vue`（easycom 自动注册，页面直接写标签）；
- **类名 / id / 组件名必须是 ASCII**——中文标识符会被编译成 unicode 转义，微信 WXSS 编译直接报错（血泪教训）；
- UI 优先用 wot-ui 组件与 `wot-*` UnoCSS 工具类；确需自绘时遵守 7.2 颜色纪律；
- 组件 props 用类型声明式 `defineProps<{...}>()` + JSDoc 注释；需要默认值用 `withDefaults`。

## 10. 工程化与质量门禁

| 命令 | 作用 | 时机 |
|------|------|------|
| `npm run dev:mp-weixin` | 本地开发（默认 mock） | 日常 |
| `npm run build:mp-weixin` | 生产构建（自动剥离 `console/debugger`） | 发布 |
| `npm run lint` | ESLint（0 error 0 warning 是硬门槛） | pre-commit 自动 |
| `npm run type-check` | vue-tsc 全量类型检查 | **pre-push 自动** |
| `npm run test` | vitest 单测 | verify 内含 |
| `npm run verify` | lint + type-check + test 一键全检 | 提 PR / 合并前必跑 |
| `npm run gen:business-code` | 从后端枚举生成业务码 | 后端码值变更后 |

- 提交信息遵循 Conventional Commits（commitlint 强校验），subject 用中文；
- ESLint 分三段：长期 off（uni 惯例，注释说明）/ 已收紧（error）/ 收紧路线图（注释里列出下一批规则），**不要随手加 off**；
- 生产构建自动 `drop console/debugger`（vite.config.mts），调试日志无需手动清理，但也禁止用 console 做业务逻辑。

## 11. 新页面开发 SOP

1. `pages/<page>/<page>.vue` + `pages.json` 注册（只写 title，颜色继承 globalStyle）；
2. `locales/zh-CN/<page>.json` + `en` 成对新增并注册聚合；
3. 需要接口：先在 `api/resp|req/` 定类型 → `api/<domain>.ts` 加函数 → mock 路由加 fixture（或等后端）；
4. 数据获取用 `useApi`（普通）/ `usePagedList`（分页列表）；错误处理遵循 §4.5；
5. 样式遵守颜色纪律 + 深色 checklist（§7.2/§7.3）；
6. 纯逻辑（数据变换/状态机）抽到可测函数并补 vitest 用例；
7. `npm run verify` 全绿后提交。

## 12. 测试策略

- 只测**纯逻辑层**：`api/request.ts`（协议）、`utils/auth.ts`（会话）、`themes/presets.ts`（色板）、composables 状态机（usePagedList/useApi）；
- 页面 .vue 不做组件测试（小程序渲染层成本高，UI 靠真机走查）；
- `test/setup.ts` 提供全局 `uni` mock + 内存 storage，新测试直接用；
- vitest 用 **3.x**（4.x 需要 vite 6，勿单独升级）；`vitest.config.ts` 独立于 vite.config（不加载 uni 编译链），新增 vite 插件时注意两者同步的必要性。

## 13. 环境变量与构建

| 变量 | 语义 | 入库情况 |
|------|------|----------|
| `VITE_API_BASE_URL` | 后端域名，唯一来源，未配置时请求显式报错 | `.env.development` 注释占位；生产在 `.env.production.local` 或 CI 提供 |
| `VITE_USE_MOCK` | `'true'` 时命中 mock 路由短路 | `.env.development` 默认 true |

- `*.local` 永不入库（个人差异 / 域名 / 密钥）；
- 生产构建前必须确认 `VITE_API_BASE_URL` 已配置且为备案 https 域名（小程序合法域名要求）。

## 14. 已知限制

- `pages.json` 静态色不跟随运行时主题（首帧后由 App.ku.vue 原生同步接管）；
- 小程序分包、tabBar、nvue 未在骨架中预设，需要时按 uni-app 官方文档引入并回补本文档；
- 登录执行器模板默认指向 mock 登录——**接入真实项目时这是必须替换的第一处**（`src/main.ts`）。
