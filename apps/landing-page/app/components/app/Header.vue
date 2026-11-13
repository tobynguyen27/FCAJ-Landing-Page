<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  {
    label: 'About',
    to: '#about',
  },
  {
    label: 'Events',
    to: '#events',
  },
  {
    label: 'Moments',
    to: '#moments',
  },
  {
    label: 'Team',
    to: '#team',
  },
  {
    label: 'FAQ',
    to: '#faq',
  },
]
</script>

<template>
  <UHeader>
    <template #title>
      <UColorModeImage
        decoding="async"
        loading="eager"
        :width="128"
        dark="logo-dark.png"
        light="logo-light.png"
        alt="FCAJ Logo"
      />
    </template>

    <UNavigationMenu :items variant="link" />

    <template #right>
      <UButton label="Join the community" class="cursor-pointer" />
      <UColorModeButton />
    </template>
  </UHeader>
</template>
