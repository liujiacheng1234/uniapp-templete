#!/usr/bin/env node
/**
 * 从后端 BusinessCode 枚举生成 src/api/business-code.ts。
 *
 * 用法：
 *   npm run gen:business-code
 *   node scripts/gen-business-code.mjs --backend <shared-ev-server 仓库路径>
 *   # 或环境变量 BUSINESS_CODE_BACKEND_DIR 指定后端仓库路径
 *
 * 默认后端路径为同级布局：<仓库根>/../../backend/shared-ev-server。
 * 模板项目接入自己的后端后，调整默认路径或用参数覆盖即可。
 *
 * 解析目标：<backend>/ev-rental-server/src/main/java/hk/com/abacus/server/common/error/*Code.java
 * 约定：所有领域枚举均为 `NAME(int code, String desc)` 单一构造器，实现 BusinessCode 接口。
 * 生成物为全量镜像（后端原始命名），保证码值 / 命名与后端零漂移；
 * 前端分支所需的稳定码值直接引用即可，禁止用 msg 文案做判断。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const OUTPUT_FILE = path.join(repoRoot, 'src/api/business-code.ts')

const ERROR_DIR_REL = path.join(
  'ev-rental-server',
  'src',
  'main',
  'java',
  'hk',
  'com',
  'abacus',
  'server',
  'common',
  'error'
)

/** --backend 参数 > 环境变量 > 默认同级布局 */
function resolveBackendDir() {
  const argIndex = process.argv.indexOf('--backend')
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    return path.resolve(process.argv[argIndex + 1])
  }
  if (process.env.BUSINESS_CODE_BACKEND_DIR) {
    return path.resolve(process.env.BUSINESS_CODE_BACKEND_DIR)
  }
  return path.resolve(repoRoot, '..', '..', 'backend', 'shared-ev-server')
}

/** 解析单个 *Code.java，返回 { enumName, entries: [{ name, code, desc }] }；非枚举文件返回 null */
function parseJavaEnum(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const enumDecl = source.match(/public\s+enum\s+(\w+)/)
  if (!enumDecl) {
    return null
  }
  const enumName = enumDecl[1]

  // 形如：NAME(300001, "骑行订单不存在")，或行尾逗号/分号
  const ENTRY_RE = /^\s*([A-Z][A-Z0-9_]+)\((\d+),\s*"(.*)"\)[,;]?\s*$/
  const entries = []
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(ENTRY_RE)
    if (!match) continue
    entries.push({ name: match[1], code: Number(match[2]), desc: match[3] })
  }
  if (entries.length === 0) {
    return null
  }
  return { enumName, entries }
}

function main() {
  const backendDir = resolveBackendDir()
  const errorDir = path.join(backendDir, ERROR_DIR_REL)

  if (!fs.existsSync(errorDir)) {
    console.error(`[gen-business-code] 未找到后端枚举目录：${errorDir}`)
    console.error('请确认后端仓库路径，或用 --backend <路径> / BUSINESS_CODE_BACKEND_DIR 指定。')
    process.exit(1)
  }

  const javaFiles = fs
    .readdirSync(errorDir)
    .filter((name) => name.endsWith('Code.java'))
    .sort()

  const domains = []
  for (const file of javaFiles) {
    const parsed = parseJavaEnum(path.join(errorDir, file))
    if (parsed) {
      domains.push(parsed)
    }
  }

  if (domains.length === 0) {
    console.error('[gen-business-code] 未解析到任何枚举项，请检查后端枚举格式。')
    process.exit(1)
  }

  // 跨领域重复码值提示（如 DeviceCode 500001 与 FileCode 500001）：TS 按领域导出互不影响，
  // 但排错时需注意「码值 → 领域」不唯一，先看抛错接口所在领域。
  const seen = new Map()
  const duplicates = []
  for (const domain of domains) {
    for (const entry of domain.entries) {
      if (seen.has(entry.code)) {
        duplicates.push(`${entry.code}(${seen.get(entry.code)} / ${domain.enumName}.${entry.name})`)
      } else {
        seen.set(entry.code, `${domain.enumName}.${entry.name}`)
      }
    }
  }

  const lines = []
  lines.push('/**')
  lines.push(' * 业务码 —— 由 scripts/gen-business-code.mjs 从后端 BusinessCode 枚举生成，禁止手改。')
  lines.push(' *')
  lines.push(' * 重新生成：npm run gen:business-code（后端枚举变更后必须同步执行）')
  lines.push(` * 来源：${path.relative(repoRoot, errorDir).replaceAll('\\', '/')}`)
  lines.push(' *')
  lines.push(' * 使用约定：')
  lines.push(' * 1. 命名与码值同后端 1:1（enum 名 + 常量名），不在此文件做任何改名或筛选；')
  lines.push(' * 2. 页面只需分支处理关心的码值，其余失败统一交请求层透传；')
  lines.push(' * 3. 禁止用 msg 文案做业务判断，一律比对这里的码值常量；')
  lines.push(' * 4. 同一码值可能出现在不同领域（见下方重复码值注释），排错先看接口所属 Controller。')
  lines.push(' */')

  if (duplicates.length > 0) {
    lines.push('/*')
    lines.push(' * 跨领域重复码值（仅提示，按领域导出互不影响）：')
    for (const item of duplicates) {
      lines.push(` * - ${item}`)
    }
    lines.push(' */')
  }

  for (const domain of domains) {
    lines.push('')
    lines.push(`export const ${domain.enumName} = {`)
    for (const entry of domain.entries) {
      const desc = entry.desc.replaceAll("'", "\\'")
      lines.push(`  /** ${desc} */`)
      lines.push(`  ${entry.name}: ${entry.code},`)
    }
    lines.push('} as const')
  }

  fs.writeFileSync(OUTPUT_FILE, `${lines.join('\n')}\n`, 'utf8')
  const total = domains.reduce((sum, d) => sum + d.entries.length, 0)
  console.log(
    `[gen-business-code] 已生成 ${path.relative(repoRoot, OUTPUT_FILE)}：` +
      `${domains.length} 个领域，${total} 个码值。`
  )
}

main()
