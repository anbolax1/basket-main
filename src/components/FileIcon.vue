<script setup lang="ts">
const props = defineProps<{
  filename: string
  size?: 'sm' | 'lg'
}>()

const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

const getIconColor = (ext: string) => {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500',
    doc: 'bg-blue-500',
    docx: 'bg-blue-500',
    xls: 'bg-green-500',
    xlsx: 'bg-green-500',
    txt: 'bg-gray-500',
    default: 'bg-gray-400'
  }
  return colors[ext] || colors.default
}

const extension = getFileExtension(props.filename)
const iconColor = getIconColor(extension)
const sizeClass = props.size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-full aspect-square text-sm'
</script>

<template>
  <div 
    :class="[
      'rounded-lg flex items-center justify-center text-white font-medium uppercase',
      iconColor,
      sizeClass
    ]"
  >
    {{ extension }}
  </div>
</template>