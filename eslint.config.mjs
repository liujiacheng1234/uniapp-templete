import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

// uni-app + Vue3 + TypeScript flat config
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'unpackage/**',
      'node_modules/**',
      'src/uni_modules/**',
      '**/*.d.ts',
      '*.lock',
      'docs/**',
      '.husky/**',
      // 本地 AI 工具配置目录（已 gitignore），不属于项目源码
      '.pi/**',
      '.claude/**',
      '.agents/**',
      '.codex/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    languageOptions: {
      globals: {
        uni: 'readonly',
        wx: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        plus: 'readonly',
        UniApp: 'readonly',
      },
    },
    rules: {
      // ============ 项目长期关闭（uni-app 场景天然不适用，勿盲目开启）============
      // uni 页面目录单词命名是框架惯例（pages/index、pages/login、pages/profile）
      'vue/multi-word-component-names': 'off',
      // 小程序 rich-text 无 HTML 执行环境，不存在 v-html XSS 面；项目亦未使用
      'vue/no-v-html': 'off',
      // defineProps 类型声明式写法不依赖运行时 default；需要默认值时用 withDefaults 显式声明
      'vue/require-default-prop': 'off',
      // uni / wx / getCurrentPages 等全局类型由 @dcloudio/types 提供，TS 编译已兼底
      'no-undef': 'off',

      // ============ 已收紧（存量清零后开启，2026-08-31）============
      // src 内无任何 any 使用（env.d.ts 的 vue 组件泛型除外，已有行内豁免）
      '@typescript-eslint/no-explicit-any': 'error',
      // 禁止 @ts-ignore/@ts-nocheck；确需豁免用 @ts-expect-error（无匹配时报错，防滞留）
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ============ 收紧路线图（地基稳定后逐批启用，启用前先以 warn 统计存量）============
      // 1) Vue 规则升档：flat/recommended → flat/strongly-recommended（模板属性/指令规范）
      // 2) 类型感知规则（需 parserOptions.project: './tsconfig.json'，lint 耗时上升，建议仅对 src 启用）：
      //    '@typescript-eslint/no-floating-promises': 'error'   // 拦截忘记 await 的 api/* 调用
      //    '@typescript-eslint/no-misused-promises': 'error'
      // 3) import 排序：eslint-plugin-import + import/order（@/ 别名单独分组；../ 已由 no-restricted-imports 把守）
      // 4) 调试残留：'no-console': ['error', { allow: ['warn', 'error'] }]，
      //    与构建期 esbuild drop（见 vite.config.mts）双保险
      'no-console': 'off',
      // 跨目录引用一律走 @/ 别名，避免 ../../ 层级漂移；同目录 ./ 不受限（页面私有 composables 等）
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../**'],
              message: '跨目录引用请使用 @/ 别名；同目录 ./ 相对导入不受限。',
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier
)
