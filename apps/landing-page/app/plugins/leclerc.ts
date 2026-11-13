import { treaty } from '@elysia/eden'
import type { Leclerc } from '@fcaj/leclerc'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const leclercClient = treaty<Leclerc>(runtimeConfig.public.apiUrl, {
    headers,
    fetch: {
      credentials: 'include',
    },
  })

  return {
    provide: {
      leclercClient,
    },
  }
})
