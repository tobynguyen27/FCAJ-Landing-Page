<script setup lang="ts">
import seedrandom from 'seedrandom'

const DRAG_THRESHOLD = 5

interface Icon {
  src: string
  alt: string
}

interface PlacedIcon extends Icon {
  id: string
  x: number
  y: number
  rotate: number
}

type ActiveDrag =
  | {
      kind: 'new'
      icon: Icon
    }
  | {
      kind: 'placed'
      sticker: PlacedIcon
      startX: number
      startY: number
      offsetX: number
      offsetY: number
    }

const awsIcons: Icon[] = [
  {
    src: '/aws-stickers/CloudFront.svg',
    alt: 'CloudFront',
  },
  {
    src: '/aws-stickers/DynamoDB.svg',
    alt: 'DynamoDB',
  },
  {
    src: '/aws-stickers/EC2.svg',
    alt: 'EC2',
  },
  {
    src: '/aws-stickers/Lambda.svg',
    alt: 'Lambda',
  },
  {
    src: '/aws-stickers/RDS.svg',
    alt: 'RDS',
  },
  {
    src: '/aws-stickers/Route53.svg',
    alt: 'Route53',
  },
  {
    src: '/aws-stickers/S3.svg',
    alt: 'S3',
  },
  {
    src: '/aws-stickers/WAF.svg',
    alt: 'WAF',
  },
]

function seededDeg(seed: string, min = -15, max = 15): number {
  const unit = seedrandom(seed)()
  return min + unit * (max - min)
}

const loopedIcons = Array.from({ length: 3 }, (_, copy) =>
  awsIcons.map((icon) => ({ ...icon, copy })),
).flat()

const scrollableContainer = useTemplateRef('scrollableContainer')
const board = useTemplateRef('board')
const runtimeConfig = useRuntimeConfig()

const removeStickerSound = useSound(runtimeConfig.public.soundStickerPeelOff)
const addStickerSound = useSound(runtimeConfig.public.soundStickerStickDown)

const placedIcons = ref<PlacedIcon[]>([])
const draggingStickerId = ref<string | null>(null)

const dragPreview = ref<{
  src: string
  alt: string
  x: number
  y: number
  rotate: number
} | null>(null)

const pendingStickerId = ref<string | null>(null)

let setWidth = 0

let activePointerId: number | null = null
let activeDrag: ActiveDrag | null = null
let captureElement: HTMLElement | null = null

let clickedX = 0
let clickedY = 0
let isDragging = false

onMounted(() => {
  const element = scrollableContainer.value
  if (!element) return

  const firstOfSet0 = element.children[0] as HTMLElement | undefined
  const firstOfSet1 = element.children[awsIcons.length] as HTMLElement | undefined

  if (!firstOfSet0 || !firstOfSet1) return

  setWidth = firstOfSet1.offsetLeft - firstOfSet0.offsetLeft

  element.scrollTo({
    left: setWidth,
    behavior: 'instant',
  })
})

onBeforeMount(clearPointer)

useEventListener(window, 'pointermove', onPointerMove)
useEventListener(window, 'pointerup', onPointerUp)
useEventListener(window, 'pointercancel', resetPointer)

function onScroll() {
  const element = scrollableContainer.value
  if (!element || setWidth <= 0) return

  if (element.scrollLeft < setWidth) {
    element.scrollTo({
      left: element.scrollLeft + setWidth,
      behavior: 'instant',
    })
  } else if (element.scrollLeft >= setWidth * 2) {
    element.scrollTo({
      left: element.scrollLeft - setWidth,
      behavior: 'instant',
    })
  }
}

function onPointerDown(event: PointerEvent, icon: Icon) {
  if (
    !beginPointer(event, {
      kind: 'new',
      icon,
    })
  ) {
    return
  }

  pendingStickerId.value = crypto.randomUUID()
}

function onStickerPointerDown(event: PointerEvent, sticker: PlacedIcon) {
  const element = board.value
  if (!element) return

  const rect = element.getBoundingClientRect()

  beginPointer(event, {
    kind: 'placed',
    sticker,
    startX: sticker.x,
    startY: sticker.y,
    offsetX: event.clientX - rect.left - sticker.x * rect.width,
    offsetY: event.clientY - rect.top - sticker.y * rect.height,
  })
}

function updateDrag(event: PointerEvent) {
  const drag = activeDrag
  if (!drag) return

  if (!isDragging) {
    const distance = Math.hypot(event.clientX - clickedX, event.clientY - clickedY)

    if (distance < DRAG_THRESHOLD) return

    isDragging = true

    if (drag.kind === 'placed') {
      draggingStickerId.value = drag.sticker.id

      const index = placedIcons.value.findIndex((sticker) => sticker.id === drag.sticker.id)

      if (index !== -1) {
        const [sticker] = placedIcons.value.splice(index, 1)
        placedIcons.value.push(sticker!)
      }
    }
  }

  if (drag.kind === 'new') {
    const id = pendingStickerId.value
    if (!id) return

    dragPreview.value = {
      src: drag.icon.src,
      alt: drag.icon.alt,
      x: event.clientX,
      y: event.clientY,
      rotate: seededDeg(id),
    }

    return
  }

  const element = board.value
  if (!element) return

  const rect = element.getBoundingClientRect()

  drag.sticker.x = Math.max(0, Math.min(1, (event.clientX - rect.left - drag.offsetX) / rect.width))

  drag.sticker.y = Math.max(0, Math.min(1, (event.clientY - rect.top - drag.offsetY) / rect.height))
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return

  updateDrag(event)

  const drag = activeDrag
  const wasDragging = isDragging
  const stickerId = pendingStickerId.value

  clearPointer()

  if (!drag) return

  if (drag.kind === 'placed') {
    if (!wasDragging) removeSticker(drag.sticker.id)

    return
  }

  if (!wasDragging) return

  const element = board.value
  if (!element) return

  const rect = element.getBoundingClientRect()

  if (
    event.clientX < rect.left ||
    event.clientX >= rect.right ||
    event.clientY < rect.top ||
    event.clientY >= rect.bottom
  ) {
    return
  }

  if (!stickerId) return

  placedIcons.value.push({
    ...drag.icon,
    id: stickerId,
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
    rotate: seededDeg(stickerId),
  })

  addStickerSound.play()
}

function resetPointer(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return

  if (activeDrag?.kind === 'placed') {
    activeDrag.sticker.x = activeDrag.startX
    activeDrag.sticker.y = activeDrag.startY
  }

  clearPointer()
}

function beginPointer(event: PointerEvent, drag: ActiveDrag): boolean {
  if (event.pointerType === 'mouse' && event.button !== 0) return false

  if (activePointerId !== null) return false

  const element = event.currentTarget as HTMLElement
  element.setPointerCapture(event.pointerId)

  captureElement = element
  activePointerId = event.pointerId
  activeDrag = drag

  clickedX = event.clientX
  clickedY = event.clientY
  isDragging = false

  return true
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return

  updateDrag(event)
}

function clearPointer() {
  const element = captureElement
  const pointerId = activePointerId

  activePointerId = null
  activeDrag = null
  captureElement = null
  isDragging = false

  draggingStickerId.value = null
  dragPreview.value = null
  pendingStickerId.value = null

  if (element && pointerId !== null && element.hasPointerCapture(pointerId)) {
    element.releasePointerCapture(pointerId)
  }
}

function removeSticker(id: string) {
  placedIcons.value = placedIcons.value.filter((sticker) => sticker.id !== id)
  removeStickerSound.play()
}

onBeforeUnmount(resetPointer)
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <NuxtImg
        v-if="dragPreview"
        :src="dragPreview.src"
        :alt="dragPreview.alt"
        aria-hidden="true"
        width="48"
        height="48"
        :draggable="false"
        class="rounded-sm pointer-events-none select-none fixed drop-shadow-lg"
        :style="{
          left: `${dragPreview.x}px`,
          top: `${dragPreview.y}px`,
          transform: `translate(-50%, -50%) rotate(${dragPreview.rotate}deg)`,
        }"
      />
    </Teleport>
  </ClientOnly>

  <div class="h-full w-full relative">
    <div
      id="board"
      ref="board"
      class="rounded-2xl h-full w-full relative overflow-clip from-accented to-default bg-linear-to-b"
    >
      <TransitionGroup name="sticker">
        <NuxtImg
          v-for="sticker in placedIcons"
          :key="sticker.id"
          :src="sticker.src"
          :alt="sticker.alt"
          width="92"
          height="92"
          class="rounded-sm cursor-grab select-none absolute touch-none active:cursor-grabbing"
          :style="{
            left: `${sticker.x * 100}%`,
            top: `${sticker.y * 100}%`,
            transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg)`,
            '--sticker-rotate': `${sticker.rotate}deg`,
            zIndex: draggingStickerId === sticker.id ? 10 : 5,
            cursor: draggingStickerId === sticker.id ? 'grabbing' : undefined,
          }"
          :draggable="false"
          decoding="async"
          @pointerdown="onStickerPointerDown($event, sticker)"
        />
      </TransitionGroup>

      <UColorModeImage
        :draggable="false"
        light="logo-dark.png"
        dark="logo-light.png"
        width="256"
        class="px-12 select-none left-1/2 top-1/2 absolute -translate-1/2"
      />
    </div>

    <div
      v-motion-slide-visible-bottom
      class="border border-default rounded-full bg-default max-w-md w-full left-1/2 absolute z-20 overflow-hidden -translate-x-1/2 -bottom-10"
    >
      <div
        id="scrollable-container"
        ref="scrollableContainer"
        class="px-5 py-5 scroll-smooth flex gap-3 w-full items-center overflow-x-auto"
        @scroll="onScroll"
      >
        <button
          v-for="icon in loopedIcons"
          :key="icon.alt"
          class="shrink-0 size-12 cursor-grab transition-transform duration-200 touch-none active:(cursor-grabbing scale-100) hover:scale-125"
          @dragstart.prevent
          @pointerdown="(event) => onPointerDown(event, icon)"
        >
          <NuxtImg
            :src="icon.src"
            :alt="icon.alt"
            width="48"
            height="48"
            class="rounded-sm pointer-events-none select-none"
            :draggable="false"
            decoding="async"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#board {
  transform-origin: center;
  backface-visibility: hidden;
  animation: board-flip-in-x 500ms ease-out both;
}

@keyframes board-flip-in-x {
  from {
    opacity: 0;
    transform: perspective(1200px) rotateX(80deg);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.sticker-enter-active {
  animation: sticker-stick 300ms both;
}

@keyframes sticker-stick {
  0% {
    opacity: 0.5;
    transform: translate(-50%, -50%) rotate(var(--sticker-rotate, 0deg)) scale(0.52);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  40% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--sticker-rotate, 0deg)) scale(1.1);
    animation-timing-function: cubic-bezier(0.45, 0, 0.35, 1);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--sticker-rotate, 0deg)) scale(1);
  }
}

.sticker-leave-active {
  pointer-events: none;
  animation: sticker-peel 380ms both;
}

@keyframes sticker-peel {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--sticker-rotate, 0deg)) scale(1);
    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  22% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--sticker-rotate, 0deg)) scale(1.045);
    animation-timing-function: linear;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, calc(-50% + 20px)) rotate(var(--sticker-rotate, 0deg)) scale(0.75);
  }
}

#scrollable-container {
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  scrollbar-width: none;

  animation-timeline: scroll(self inline);
}

@media (prefers-reduced-motion: reduce) {
  .sticker-enter-active,
  .sticker-leave-active {
    animation: none;
  }
}

#scrollable-container::-webkit-scrollbar {
  display: none;
}
</style>
