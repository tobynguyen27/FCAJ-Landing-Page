export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Runtime
  runtimeConfig: {
    public: {
      apiUrl: 'http://localhost:3000',

      soundStickerStickDown:
        'https://uf6bgc95a30mcrkn.public.blob.vercel-storage.com/audio/stick-down.mp3',
      soundStickerPeelOff:
        'https://uf6bgc95a30mcrkn.public.blob.vercel-storage.com/audio/peel-off.mp3',
    },
  },

  // Build
  builder: 'vite',

  // Nitro
  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        runtime: 'bun1.x',
      },
    },
  },

  // Dev
  devServer: {
    port: 3001,
  },

  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@vueuse/sound/nuxt',
    '@nuxt/scripts',
    '@nuxt/image',
  ],
  icon: {
    clientBundle: {
      scan: true,
    },
  },
  image: {
    format: ['avif', 'webp'],
    dir: 'assets/images',
    vercel: {
      formats: ['image/avif', 'image/webp'],
    },
  },
  scripts: {
    registry: {
      vercelAnalytics: {
        trigger: 'onNuxtReady',
      },
    },
  },
  fonts: {
    provider: 'local',
  },
})
