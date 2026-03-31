<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  as: {
    type: String,
    default: 'button', // može biti 'button' ili 'router-link'
  },
  to: {
    type: [String, Object],
    default: null,
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
})

const classes = computed(() => {
  const base =
    'rounded-full font-medium transition duration-200 shadow-sm hover:shadow-md cursor-pointer'

  const sizes = {
    sm: 'px-2 py-1.5 text-xs',
    md: 'px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  }

  const disabledStyle = props.disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:-translate-y-[1px] active:translate-y-0'

  return `${base} ${sizes[props.size]} ${variants[props.variant]} ${disabledStyle}`
})
</script>

<template>
  <component
    :is="as"
    :class="classes"
    :type="as === 'button' ? type : undefined"
    :to="as === 'router-link' ? to : undefined"
    :disabled="as === 'button' ? loading || disabled : undefined"
  >
    <span v-if="loading">Loading...</span>
    <slot v-else />
  </component>
</template>
