<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import FileIcon from './FileIcon.vue'

interface UploadedFile {
  id: string
  name: string
  preview: string
  comment: string
}

const props = defineProps<{
  file: UploadedFile
  selectionMode: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateComment', fileId: string, comment: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  // Focus the textarea after the modal is mounted
  if (!props.selectionMode) {
    textareaRef.value?.focus()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

const isImage = computed(() => {
  const ext = props.file.name.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
})
</script>

<template>
  <div 
    class="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div 
      class="bg-telegram-bg rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-700">
        <h3 class="text-xl font-semibold truncate pr-4">{{ file.name }}</h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white p-2"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden p-4">
        <div class="h-full flex items-center justify-center bg-telegram-bg rounded-lg">
          <img
            v-if="isImage"
            :src="file.preview"
            :alt="file.name"
            class="max-w-full max-h-[60vh] object-contain"
          >
          <FileIcon
            v-else
            :filename="file.name"
            size="lg"
          />
        </div>
      </div>

      <!-- Comment section -->
      <div class="p-4 border-t border-gray-700">
        <textarea
          ref="textareaRef"
          :value="file.comment"
          @input="e => $emit('updateComment', file.id, (e.target as HTMLTextAreaElement).value)"
          placeholder="Add a comment..."
          class="w-full bg-telegram-hover border border-gray-600 rounded-lg p-3 focus:outline-none focus:border-telegram-primary resize-none"
          rows="3"
        ></textarea>
        <div class="flex justify-end mt-4">
          <button
            @click="$emit('close')"
            class="bg-telegram-primary hover:bg-telegram-secondary px-6 py-2 rounded-lg transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.2s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}
</style>