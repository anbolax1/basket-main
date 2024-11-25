<script setup lang="ts">
import SelectableItem from './SelectableItem.vue'

const props = defineProps<{
  value: string
  selected: boolean
  selectionMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'select'): void
  (e: 'startSelection'): void
}>()
</script>

<template>
  <SelectableItem
      :selected="selected"
      :selection-mode="selectionMode"
      @select="$emit('select')"
      @start-selection="$emit('startSelection')"
  >
    <div class="flex flex-col">
      <textarea
        :value="value"
        @input="e => emit('update', (e.target as HTMLTextAreaElement).value)"
        placeholder="Type a message..."
        class="w-full bg-telegram-hover border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-telegram-primary resize-y min-h-[100px]"
        @click.stop
      />
    </div>
  </SelectableItem>
</template>