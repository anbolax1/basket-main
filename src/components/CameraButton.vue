<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'photo-captured', file: File): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const showCamera = ref(false)

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }
    })
    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play() // Explicitly start playing
      showCamera.value = true
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    alert('Unable to access camera. Please ensure you have granted camera permissions.')
  }
}

const stopCamera = () => {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach(track => track.stop())
    streamRef.value = null
  }
  showCamera.value = false
}

const capturePhoto = () => {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.drawImage(videoRef.value, 0, 0)
  
  canvas.toBlob((blob) => {
    if (!blob) return
    
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
    emit('photo-captured', file)
    stopCamera()
  }, 'image/jpeg', 0.8)
}

// Cleanup on component unmount
onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <div class="relative mobile-only">
    <button
      v-if="!showCamera"
      @click="startCamera"
      class="bg-telegram-primary hover:bg-telegram-secondary px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
      Take Photo
    </button>

    <div
      v-if="showCamera"
      class="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
    >
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="max-w-full max-h-[70vh] mb-4 rounded-lg"
      ></video>
      
      <div class="flex gap-4">
        <button
          @click="capturePhoto"
          class="bg-telegram-primary hover:bg-telegram-secondary px-6 py-3 rounded-full transition-colors"
        >
          Capture
        </button>
        <button
          @click="stopCamera"
          class="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .mobile-only {
    display: block;
  }
}

video {
  width: 100%;
  object-fit: contain;
  background-color: #000;
}
</style>