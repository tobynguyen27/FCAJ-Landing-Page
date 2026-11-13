<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const links = ref<ButtonProps[]>([
  {
    label: 'Explore learning path',
    trailingIcon: 'i-lucide-arrow-right',
    class: 'cursor-pointer text-sm',
    ui: {
      trailingIcon: 'size-4',
    },
  },
  {
    label: 'Browse events',
    trailingIcon: 'i-lucide-arrow-down',
    class: 'cursor-pointer text-sm',
    ui: {
      trailingIcon: 'size-4',
    },
    variant: 'outline',
    color: 'neutral',
  },
])
</script>

<template>
  <UPageHero
    description="A home for cloud builders, engineers and students — learning, shipping and growing together on AWS. Explore learning paths"
    :links
    orientation="horizontal"
    :ui="{ wrapper: 'order-last lg:order-0' }"
  >
    <template #title>
      A place to learn cloud. <span class="text-dimmed">Build what's next.</span>
    </template>

    <div class="w-full h-128">
      <StickerBoard />
    </div>
  </UPageHero>
</template>
