<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  selected: boolean
  selectionMode: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'startSelection'): void
}>()

const longPressTimeout = ref<number | null>(null)
const isPressed = ref(false)

const handleTouchStart = () => {
  isPressed.value = true
  longPressTimeout.value = window.setTimeout(() => {
    emit('startSelection')
  }, 500) // 500ms for long press
}

const handleTouchEnd = () => {
  isPressed.value = false
  if (longPressTimeout.value) {
    clearTimeout(longPressTimeout.value)
  }
}

const handleClick = () => {
  if (props.selectionMode) {
    emit('select')
  }
}

const classes = computed(() => ({
  'relative cursor-pointer': true,
  'selection-active': props.selectionMode,
  'selected': props.selected,
  'pressed': isPressed.value
}))
</script>

<template>
  <div
      :class="classes"
      @mousedown="handleTouchStart"
      @mouseup="handleTouchEnd"
      @mouseleave="handleTouchEnd"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      @click="handleClick"
  >
    <!-- Selection overlay -->
    <div
        v-if="selectionMode"
        class="absolute inset-0 bg-telegram-primary/10 pointer-events-none"
        :class="{ 'opacity-100': selected, 'opacity-0': !selected }"
    >
      <div
          class="absolute top-2 right-2 w-5 h-5 rounded-full border-2"
          :class="selected ? 'bg-telegram-primary border-telegram-primary' : 'border-white'"
      >
        <svg
            v-if="selected"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-full h-full text-white"
        >
          <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.selection-active {
  user-select: none;
}

.pressed {
  transform: scale(0.98);
  transition: transform 0.2s;
}
</style>