import common from './common.json'
import theme from './theme.json'
import settings from './settings.json'
import index from './index.json'
import login from './login.json'
import list from './list.json'
import form from './form.json'

/**
 * 语言包聚合：一个页面/领域一个命名空间（文件名与命名空间一致）。
 * 新增页面：建 <namespace>.json（zh-CN 与 en 成对）→ 这里 import + 注册 → 页面 t('<namespace>.key')。
 * 缺 key 时回退 zh-CN（见 locales/index.ts fallbackLocale）。
 */
export default {
  common,
  theme,
  settings,
  index,
  login,
  list,
  form,
}
