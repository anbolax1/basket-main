<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDropZone } from '@vueuse/core'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import FileModal from './FileModal.vue'
import FileIcon from './FileIcon.vue'

import 'swiper/css'
import 'swiper/css/navigation'

interface UploadedFile {
  id: string
  name: string
  preview: string
  comment: string
}

const props = defineProps<{
  files: UploadedFile[]
  hasText: boolean
  blockId: string
}>()

const emit = defineEmits<{
  (e: 'updateComment', fileId: string, comment: string): void
  (e: 'fileUpload', files: File[]): void
}>()

const dropZoneRef = ref<HTMLElement | null>(null)
const { isOverDropZone } = useDropZone(dropZoneRef)
const showModal = ref(false)
const selectedFile = ref<UploadedFile | null>(null)
const hasFiles = computed(() => props.files.length > 0)

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files) {
    emit('fileUpload', Array.from(files))
  }
}

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    emit('fileUpload', Array.from(input.files))
  }
  // Reset input value to allow uploading the same file again
  input.value = ''
}

const openModal = (file: UploadedFile) => {
  selectedFile.value = file
  showModal.value = true
}

const handleCommentUpdate = (fileId: string, comment: string) => {
  emit('updateComment', fileId, comment)
}

const isImage = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

const swiperParams = {
  modules: [Navigation],
  slidesPerView: 1,
  spaceBetween: 16,
  navigation: true,
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    }
  }
}
</script>

<template>
  <div class="relative">
    <!-- Centered drop zone when no files -->
    <div
      v-if="!hasFiles"
      class="aspect-square max-w-[300px] mx-auto"
    >
      <div
        ref="dropZoneRef"
        @drop="handleFileDrop"
        @dragover.prevent
        :class="[
          'h-full border-2 border-dashed rounded-lg transition-colors text-center flex flex-col items-center justify-center',
          isOverDropZone
            ? 'border-telegram-primary bg-telegram-hover'
            : 'border-gray-600 hover:border-telegram-primary'
        ]"
      >
        <input
          :id="`fileInput-${blockId}`"
          type="file"
          multiple
          class="hidden"
          @change="handleFileInput"
        >
        <label
          :for="`fileInput-${blockId}`"
          class="cursor-pointer flex justify-center flex-col h-full w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div class="text-sm mb-1">Drop files here</div>
          <div class="text-xs text-gray-400">or click to upload</div>
          <div v-if="hasText" class="text-xs text-telegram-primary mt-2">
            Will create a new block
          </div>
        </label>
      </div>
    </div>

    <!-- Carousel with drop zone when files exist -->
    <Swiper v-else v-bind="swiperParams">
      <SwiperSlide class="!h-auto">
        <div class="bg-telegram-hover rounded-lg p-2 h-full">
          <div class="preview-container mb-2 h-full">
            <div
              ref="dropZoneRef"
              @drop="handleFileDrop"
              @dragover.prevent
              :class="[
                'preview-wrapper border-2 border-dashed transition-colors text-center flex flex-col items-center justify-center',
                isOverDropZone
                  ? 'border-telegram-primary bg-telegram-hover'
                  : 'border-gray-600 hover:border-telegram-primary'
              ]"
            >
              <input
                :id="`fileInput-${blockId}`"
                type="file"
                multiple
                class="hidden"
                @change="handleFileInput"
              >
              <label
                :for="`fileInput-${blockId}`"
                class="cursor-pointer flex justify-center flex-col h-full w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div class="text-sm mb-1">Drop files here</div>
                <div class="text-xs text-gray-400">or click to upload</div>
                <div v-if="hasText" class="text-xs text-telegram-primary mt-2">
                  Will create a new block
                </div>
              </label>
            </div>
          </div>
          <!-- Empty space to match comment input height -->
          <div class="h-[26px]"></div>
        </div>
      </SwiperSlide>

      <SwiperSlide
        v-for="file in files"
        :key="file.id"
        class="!h-auto"
      >
        <div
          class="bg-telegram-hover rounded-lg p-2 cursor-pointer h-full"
          @click="openModal(file)"
        >
          <div class="preview-container mb-2">
            <div class="preview-wrapper">
              <img
                v-if="isImage(file.name)"
                :src="file.preview"
                :alt="file.name"
                class="preview-image"
              >
              <FileIcon
                v-else
                :filename="file.name"
              />
            </div>
          </div>
          <div class="text-sm truncate">{{ file.name }}</div>
          <input
            type="text"
            :value="file.comment"
            @input="e => handleCommentUpdate(file.id, (e.target as HTMLInputElement).value)"
            placeholder="Add a comment..."
            class="mt-2 w-full bg-telegram-bg border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-telegram-primary"
            @click.stop
          >
        </div>
      </SwiperSlide>
    </Swiper>

    <FileModal
      v-if="showModal && selectedFile"
      :file="selectedFile"
      @close="showModal = false"
      @update-comment="handleCommentUpdate"
    />
  </div>
</template>

<style>
.swiper {
  padding: 0 2.5rem;
}

.swiper-button-next,
.swiper-button-prev {
  color: theme('colors.telegram.primary');
  transform: scale(0.7);
  width: 2rem;
  height: 2rem;
  margin-top: -2rem;
  background: theme('colors.telegram.bg');
  border-radius: 50%;
  border: 2px solid theme('colors.telegram.primary');
}

.swiper-button-next {
  right: 0;
}

.swiper-button-prev {
  left: 0;
}

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 1rem;
  font-weight: bold;
}

.swiper-button-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.preview-container {
  width: 100%;
  padding-top: 100%;
  position: relative;
}

.preview-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: theme('colors.telegram.bg');
  border-radius: 0.5rem;
  overflow: hidden;
}

.preview-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>