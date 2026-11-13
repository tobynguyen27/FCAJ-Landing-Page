import { join } from 'node:path'

import { aot } from 'elysia/plugin/aot/bun'

const entrypoint = join(import.meta.dir, '../src/index.ts')

Bun.build({
  entrypoints: [entrypoint],
  outdir: 'dist',
  target: 'bun',
  plugins: [aot(entrypoint, { target: 'bun' })],
}).then(() => process.exit(0))
