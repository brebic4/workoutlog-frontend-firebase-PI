<script setup>
import { ref, watch } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  defaultName: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const templateName = ref('')

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      templateName.value = props.defaultName || ''
    }
  },
)

const onSubmit = () => {
  const trimmed = templateName.value.trim()
  if (!trimmed) return
  emit('save', trimmed)
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      <h2 class="text-xl font-bold text-slate-800 dark:text-gray-100">Spremi kao template</h2>

      <p class="mt-2 text-sm text-slate-500 dark:text-gray-400">Unesi naziv templatea.</p>

      <div class="mt-4">
        <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-gray-200">
          Naziv templatea
        </label>

        <input
          v-model="templateName"
          type="text"
          placeholder="Npr. Gym - upper body"
          class="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          @keydown.enter="onSubmit"
        />
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <BaseButton variant="secondary" @click="$emit('close')"> Odustani </BaseButton>

        <BaseButton :disabled="!templateName.trim() || loading" @click="onSubmit">
          {{ loading ? 'Spremanje...' : 'Spremi template' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
