<script setup lang="ts">
import { ref } from 'vue'
import FileCarousel from './FileCarousel.vue'
import MessageInput from './MessageInput.vue'

interface UploadedFile {
  id: string
  name: string
  preview: string
  comment: string
  selected?: boolean
}

const props = defineProps<{
  blockId: string
  files: UploadedFile[]
  message: string
  selectionMode: boolean
  selectedFiles: string[]
  messageSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'fileUpload', blockId: string, files: File[]): void
  (e: 'updateComment', fileId: string, comment: string): void
  (e: 'updateMessage', message: string): void
  (e: 'selectFile', fileId: string): void
  (e: 'selectMessage'): void
  (e: 'startSelection', type: 'file' | 'message', id?: string): void
}>()

const handleFileUpload = (files: File[]) => {
  emit('fileUpload', props.blockId, files)
}
</script>

<template>
  <div class="space-y-8 bg-telegram-hover/20 rounded-lg p-6">
    <FileCarousel 
      :block-id="blockId"
      :files="files"
      :has-text="!!message.trim()"
      @update-comment="(fileId, comment) => emit('updateComment', fileId, comment)"
      @file-upload="handleFileUpload"
      @select="fileId => emit('selectFile', fileId)"
      @start-selection="fileId => emit('startSelection', 'file', fileId)"
    />

    <div class="border-t border-gray-700 pt-8">
      <MessageInput
        :value="message"
        :selected="messageSelected"
        :selection-mode="selectionMode"
        @update="message => emit('updateMessage', message)"
        @select="() => emit('selectMessage')"
        @start-selection="() => emit('startSelection', 'message')"
      />
    </div>
  </div>
</template>