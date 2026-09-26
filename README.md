# uni-app + Vue3 + TS + wot-ui 前端骨架模板

开箱即跑（mock 驱动）的小程序前端骨架。**开发前必读 [`docs/frontend-architecture.md`](docs/frontend-architecture.md)** —— 后续所有项目的前端开发都以该文档为架构规范。

## 快速开始

> 要求 Node ≥ 22.12（依赖树硬约束，`.npmrc` 已开 `engine-strict`，低版本 `npm install` 直接报错）。

```bash
git init              # 先初始化 git（husky 钩子依赖 git 仓库，否则 prepare 仅告警）
npm install            # 包管理器只用 npm
npm run dev:mp-weixin  # 微信开发者工具导入 dist/dev/mp-weixin
```

模板默认 `VITE_USE_MOCK=true`：示例页全部走本地 mock 数据，**不需要后端**即可运行（数据见 `src/mocks/handlers.ts`）。

内置示例页：

| 页面     | 演示内容                                            |
| -------- | --------------------------------------------------- |
| 首页     | 架构导览、主题色预览（token 消费）                  |
| 通用设置 | 主题预设（品牌绿/对比蓝）× 深色模式 × 语言切换      |
| 列表示例 | `usePagedList` 分页状态机 + 触底加载 + 状态标签组件 |
| 表单示例 | 输入校验、提交 loading、成功回执                    |
| 登录示例 | 登录会话落盘、鉴权头注入、静默重登链路              |

## 常用命令

| 命令                        | 说明                                            |
| --------------------------- | ----------------------------------------------- |
| `npm run verify`            | lint + type-check + test 一键全检（合并前必跑） |
| `npm run test:watch`        | 单测 watch 模式                                 |
| `npm run build:mp-weixin`   | 生产构建（自动剥离 console/debugger）           |
| `npm run gen:business-code` | 从后端枚举生成业务码（后端码值变更后执行）      |

## 接入真实项目 checklist

按顺序完成（详见架构文档）：

1. **改标识**：`package.json` name、`manifest.json` name/description、微信 `mp-weixin.appid`；
2. **后端域名**：`.env.development` 配置 `VITE_API_BASE_URL`，生产写 `.env.production.local`（或 CI 注入）；确认 mock 开关按需关闭；
3. **登录**：替换 `src/main.ts` 里 `configureAuth(...)` 的执行器为真实登录（如微信 code 登录），登录页 UI 对应替换；
4. **业务码**：`scripts/gen-business-code.mjs` 指向后端仓库，跑 `npm run gen:business-code` 生成 `src/api/business-code.ts`；
5. **业务枚举**：按后端枚举补 `src/enums/`（1:1 码值 + Label 映射）；
6. **删示例**：`src/pages/examples/*` 与对应 mock 路由、locale 命名空间整组删除，`pages.json` 同步（须在第 3 步登录执行器已替换为真实实现后进行，否则删除 `api/example.ts` 会让 `main.ts` 编译失败）；
7. **静态资源**：替换 `src/static/`；
8. `npm run verify` 全绿后开始业务开发。

## 质量门禁

- pre-commit：ESLint + Prettier（增量）
- pre-push：`vue-tsc` 全量类型检查
- 提交信息：Conventional Commits（commitlint 校验）
- 一键全检：`npm run verify`（lint 0 error 0 warning + type-check 0 error + 单测全绿）
- CI：GitHub Actions 在 push / PR 时自动跑 `npm run verify`（本地钩子可被 `--no-verify` 绕过，CI 是最终门禁）
- 构建期校验：`build:*` 时若 `VITE_API_BASE_URL` 未配置直接报错中止，mock 误开 loudly 告警（见 `vite.config.mts`）
