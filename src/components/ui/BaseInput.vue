<script setup>
import { computed } from 'vue'
import { ref, watch } from 'vue'

const inputRef = ref(null)

// omogućava parent komponenti da pristupi input elementu
defineExpose({
  focus: () => {
    inputRef.value?.focus()
  },
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  error: String,
  textarea: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const inputClasses = computed(() => {
  const base = 'w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2'

  const errorClasses = props.error
    ? 'border-red-500 focus:ring-red-300'
    : 'border-gray-300 focus:ring-blue-300'

  const rightPadding = isPassword.value ? ' pr-10' : ''

  return `${base}${rightPadding} ${errorClasses}`
})

const showPassword = ref(false)

const isPassword = computed(() => props.type === 'password')

const resolvedType = computed(() => {
  if (!isPassword.value) return props.type
  return showPassword.value ? 'text' : 'password'
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

watch(
  () => props.modelValue,
  () => {
    if (!isPassword.value) return
    showPassword.value = false
  },
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <textarea
      v-if="textarea"
      ref="inputRef"
      :value="modelValue"
      :class="inputClasses"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <div v-else class="relative">
      <input
        ref="inputRef"
        :type="resolvedType"
        :value="modelValue"
        :class="inputClasses"
        @input="emit('update:modelValue', $event.target.value)"
      />

      <!-- Eye toggle samo ako je password -->
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md cursor-pointer hover:bg-gray-100"
        @click="togglePassword"
        :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
      >
        <!-- Eye -->
        <svg
          v-if="!showPassword"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5 text-gray-600"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>

        <!-- Eye Off -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5 text-gray-600"
        >
          <path
            d="M10.733 5.08A10.744 10.744 0 0 1 12 5c6.5 0 10 7 10 7a18.16 18.16 0 0 1-1.67 2.68"
          />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7c1.5 0 2.87-.37 4.07-1.01" />
          <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
          <path d="m1 1 22 22" />
        </svg>
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
