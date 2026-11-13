import { consola } from 'consola'
import { Elysia } from 'elysia'

import { port } from './infra/config'
import { enrollmentsModule } from './modules/enrollments/enrollments.controller'

export const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .use(enrollmentsModule)
  .listen(port, () => {
    consola.info(`Backend is running at http://${app.server?.hostname}:${app.server?.port}`)
  })

// the codename of backend is Leclerc
export type Leclerc = typeof app
