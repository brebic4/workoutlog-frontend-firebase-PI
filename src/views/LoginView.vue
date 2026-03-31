<script setup>
import { nextTick, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const formError = ref('')
const passwordInputRef = ref(null)
const emailInputRef = ref(null)

const clearError = () => {
  formError.value = ''
}

const onEmailInput = (val) => {
  email.value = val
  if (formError.value) clearError()
}

const onPasswordInput = (val) => {
  password.value = val
  if (formError.value) clearError()
}

onMounted(async () => {
  await nextTick()
  emailInputRef.value?.focus()
})

const extractMessage = (e) => {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error?.message ||
    e?.response?.data?.error ||
    auth.error ||
    e?.message ||
    'Neuspješna prijava.'
  )
}

const submit = async () => {
  clearError()

  if (!email.value || !password.value) {
    formError.value = 'Unesi email i lozinku.'
    return
  }

  try {
    await auth.login(email.value, password.value)
    router.push('/workouts')
  } catch (e) {
    formError.value = extractMessage(e)
    password.value = ''

    await nextTick()
    passwordInputRef.value?.focus()
  }
}
</script>

<template>
  <div class="flex justify-center mt-16">
    <BaseCard class="w-full max-w-md space-y-4">
      <h2 class="text-2xl font-bold text-center">Login</h2>

      <form class="space-y-4" @submit.prevent="submit">
        <BaseInput
          ref="emailInputRef"
          label="Email"
          type="email"
          :modelValue="email"
          @update:modelValue="onEmailInput"
        />

        <BaseInput
          ref="passwordInputRef"
          label="Lozinka"
          type="password"
          :modelValue="password"
          @update:modelValue="onPasswordInput"
        />

        <Transition name="fade-slide">
          <p v-if="formError" class="text-sm font-bold text-red-600">
            {{ formError }}
          </p>
        </Transition>

        <BaseButton class="w-full" :loading="auth.loading" type="submit"> Prijava </BaseButton>
      </form>

      <p class="text-sm text-center text-gray-600">
        Nemaš račun?
        <router-link class="text-blue-600 hover:underline" to="/register">
          Registriraj se
        </router-link>
      </p>
    </BaseCard>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
