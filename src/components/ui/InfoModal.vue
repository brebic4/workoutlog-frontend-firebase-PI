<script setup>
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Obavijest',
  },
  message: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <BaseCard class="w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <p class="text-gray-700">{{ message }}</p>

        <div class="flex justify-end pt-2">
          <BaseButton variant="primary" @click="emit('close')"> OK </BaseButton>
        </div>
      </BaseCard>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
