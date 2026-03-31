<script setup>
import BaseCard from './BaseCard.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  show: Boolean,
  title: {
    type: String,
    default: 'Potvrda',
  },
  message: {
    type: String,
    default: 'Jeste li sigurni?',
  },
  singleButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <BaseCard class="w-full max-w-md space-y-4">
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <p class="text-gray-700">{{ message }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <!-- Ako je singleButton -> samo OK -->
          <template v-if="singleButton">
            <BaseButton type="button" @click="$emit('confirm')"> OK </BaseButton>
          </template>

          <template v-else>
            <BaseButton variant="secondary" @click="emit('cancel')"> Ne </BaseButton>
            <BaseButton @click="emit('confirm')"> Da </BaseButton>
          </template>
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
