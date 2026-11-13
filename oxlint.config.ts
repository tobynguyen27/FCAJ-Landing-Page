import { defineConfig } from 'oxlint'

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  plugins: ['import', 'promise', 'vitest', 'node'],
  overrides: [
    {
      files: ['apps/backend/**/*'],
      plugins: ['import', 'promise', 'vitest'],
      rules: {
        'effecttsgo/unstable-api-usage': 'off',
        'vitest/no-standalone-expect': [
          'error',
          {
            additionalTestBlockFunctions: ['it.effect', 'it.live'],
          },
        ],
      },
    },
  ],
})
