<script setup lang="ts">
const props = defineProps<{
  value: string
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col">
    <textarea
      :value="value"
      @input="e => emit('update', (e.target as HTMLTextAreaElement).value)"
      placeholder="Type a message..."
      class="w-full bg-telegram-hover border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-telegram-primary resize-y min-h-[100px]"
    />
  </div>
</template>