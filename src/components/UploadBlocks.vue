<script setup lang="ts">
import { ref, computed } from 'vue'
import FileUpload from './FileUpload.vue'

interface UploadBlock {
  id: string
  files: UploadedFile[]
  message: string
  selectedFiles: string[]
  messageSelected: boolean
}

interface UploadedFile {
  id: string
  name: string
  preview: string
  comment: string
}

const blocks = ref<UploadBlock[]>([
  {
    id: 'initial',
    files: [],
    message: '',
    selectedFiles: [],
    messageSelected: false
  }
])

const selectionMode = ref(false)

const selectedCount = computed(() => {
  return blocks.value.reduce((count, block) => {
    return count + block.selectedFiles.length + (block.messageSelected ? 1 : 0)
  }, 0)
})

const startSelection = (blockId: string, type: 'file' | 'message', id?: string) => {
  if (!selectionMode.value) {
    selectionMode.value = true
    if (type === 'file' && id) {
      selectFile(blockId, id)
    } else if (type === 'message') {
      selectMessage(blockId)
    }
  }
}

const selectFile = (blockId: string, fileId: string) => {
  const block = blocks.value.find(b => b.id === blockId)
  if (!block) return

  const index = block.selectedFiles.indexOf(fileId)
  if (index === -1) {
    block.selectedFiles.push(fileId)
  } else {
    block.selectedFiles.splice(index, 1)
  }

  // Exit selection mode if nothing is selected
  if (selectedCount.value === 0) {
    selectionMode.value = false
  }
}

const selectMessage = (blockId: string) => {
  const block = blocks.value.find(b => b.id === blockId)
  if (!block) return

  block.messageSelected = !block.messageSelected

  // Exit selection mode if nothing is selected
  if (selectedCount.value === 0) {
    selectionMode.value = false
  }
}

const cancelSelection = () => {
  selectionMode.value = false
  blocks.value.forEach(block => {
    block.selectedFiles = []
    block.messageSelected = false
  })
}

const deleteSelected = () => {
  blocks.value = blocks.value.map(block => ({
    ...block,
    files: block.files.filter(f => !block.selectedFiles.includes(f.id)),
    message: block.messageSelected ? '' : block.message,
    selectedFiles: [],
    messageSelected: false
  }))
  selectionMode.value = false
}

const handleFileUpload = (blockId: string, files: File[]) => {
  const blockIndex = blocks.value.findIndex(b => b.id === blockId)
  if (blockIndex === -1) return

  const block = blocks.value[blockIndex]
  
  if (block.message.trim()) {
    // Create new block with all files at the bottom
    const newBlock: UploadBlock = {
      id: Math.random().toString(36).substring(7),
      files: [],
      message: ''
    }
    blocks.value.push(newBlock)
    files.forEach(file => simulateUpload(file, newBlock.id))
  } else {
    // Add all files to current block
    files.forEach(file => simulateUpload(file, blockId))
  }
}

const simulateUpload = async (file: File, blockId: string) => {
  const blockIndex = blocks.value.findIndex(b => b.id === blockId)
  if (blockIndex === -1) return

  const id = Math.random().toString(36).substring(7)
  const preview = file.type.startsWith('image/') 
    ? URL.createObjectURL(file)
    : `https://via.placeholder.com/150?text=${file.name.substring(0, 3)}`

  const newFile: UploadedFile = {
    id,
    name: file.name,
    preview,
    comment: ''
  }

  blocks.value[blockIndex].files.push(newFile)
}

const updateComment = (blockId: string, fileId: string, comment: string) => {
  const block = blocks.value.find(b => b.id === blockId)
  if (!block) return

  const fileIndex = block.files.findIndex(f => f.id === fileId)
  if (fileIndex !== -1) {
    block.files[fileIndex].comment = comment
  }
}

const updateMessage = (blockId: string, message: string) => {
  const block = blocks.value.find(b => b.id === blockId)
  if (block) {
    block.message = message
  }
}

const removeBlock = (blockId: string) => {
  const index = blocks.value.findIndex(b => b.id === blockId)
  if (index > 0) {
    blocks.value.splice(index, 1)
  }
}

const sendAllMessages = () => {
  blocks.value.forEach(block => {
    if (block.message.trim() || block.files.length > 0) {
      console.log('Sending block:', {
        message: block.message,
        files: block.files
      })
    }
  })
  // Reset to initial state after sending
  blocks.value = [{
    id: 'initial',
    files: [],
    message: ''
  }]
}
</script>

<template>
  <div class="pb-24">
    <div class="max-w-2xl mx-auto p-4 space-y-12">
      <div 
        v-for="(block, index) in blocks" 
        :key="block.id"
        class="relative"
      >
        <div 
          v-if="blocks.length > 1" 
          class="absolute -left-8 top-0 w-6 h-6 rounded-full bg-telegram-primary flex items-center justify-center text-sm font-medium"
        >
          {{ index + 1 }}
        </div>

        <button
          v-if="index > 0"
          @click="removeBlock(block.id)"
          class="absolute -right-8 top-0 text-gray-400 hover:text-white"
          title="Remove block"
        >
          ✕
        </button>

        <FileUpload
          :block-id="block.id"
          :files="block.files"
          :message="block.message"
          :selection-mode="selectionMode"
          :selected-files="block.selectedFiles"
          :message-selected="block.messageSelected"
          @file-upload="handleFileUpload"
          @update-comment="(fileId, comment) => updateComment(block.id, fileId, comment)"
          @update-message="message => updateMessage(block.id, message)"
          @select-file="fileId => selectFile(block.id, fileId)"
          @select-message="() => selectMessage(block.id)"
          @start-selection="(type, id) => startSelection(block.id, type, id)"
        />
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-telegram-bg border-t border-gray-700 p-4 z-50">
      <div class="max-w-2xl mx-auto">
        <div v-if="selectionMode" class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <button
                @click="cancelSelection"
                class="text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <span>{{ selectedCount }} selected</span>
          </div>
          <button
              @click="deleteSelected"
              class="text-red-500 hover:text-red-400"
          >
            Delete
          </button>
        </div>

        <button
            v-else
            @click="sendAllMessages"
            class="w-full bg-telegram-primary hover:bg-telegram-secondary px-8 py-4 rounded-full transition-all duration-200 transform shadow-lg font-medium tracking-wide flex items-center justify-center gap-2"
        >
          <span>Send Messages</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>