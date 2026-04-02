<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseCard from './BaseCard.vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  currentUsername: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])

const username = ref('')
const formError = ref('')
const usernameInputRef = ref(null)

watch(
  () => props.show,
  async (val) => {
    if (val) {
      username.value = props.currentUsername || ''
      formError.value = ''
      await nextTick()
      usernameInputRef.value?.focus()
    }
  },
)

const onUsernameInput = (val) => {
  username.value = val
  if (formError.value) formError.value = ''
}

const submit = () => {
  const trimmed = username.value.trim()

  if (!trimmed) {
    formError.value = 'Username ne može biti prazan.'
    return
  }

  if (trimmed === props.currentUsername) {
    formError.value = 'Unesi novi username.'
    return
  }

  emit('save', trimmed)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    @click.self="$emit('close')"
  >
    <BaseCard class="w-full max-w-md space-y-4">
      <h2 class="text-xl font-bold">Promijeni username</h2>

      <BaseInput
        ref="usernameInputRef"
        label="Novi username"
        type="text"
        :modelValue="username"
        @update:modelValue="onUsernameInput"
      />

      <p v-if="formError" class="text-sm font-bold text-red-600 dark:text-gray-400">
        {{ formError }}
      </p>

      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="$emit('close')"> Odustani </BaseButton>

        <BaseButton :loading="loading" @click="submit"> Spremi </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
