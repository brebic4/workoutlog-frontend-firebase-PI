<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getAuthErrorMessage } from '@/utils/authErrorMessages'

import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import InfoModal from '../components/ui/InfoModal.vue'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')

const formError = ref('')

const passwordInputRef = ref(null)
const repeatPasswordInputRef = ref(null)
const usernameInputRef = ref(null)

const showSuccessModal = ref(false)
const successMessage = ref('')

const clearError = () => {
  formError.value = ''
}

const onUsernameInput = (val) => {
  username.value = val
  if (formError.value) clearError()
}

const onEmailInput = (val) => {
  email.value = val
  if (formError.value) clearError()
}

const onPasswordInput = (val) => {
  password.value = val
  if (formError.value) clearError()
}

const onRepeatPasswordInput = (val) => {
  repeatPassword.value = val
  if (formError.value) clearError()
}

onMounted(async () => {
  await nextTick()
  usernameInputRef.value?.focus()
})

const extractMessage = (e) => {
  return getAuthErrorMessage(e, 'Registracija nije uspjela.')
}

const submit = async () => {
  clearError()

  if (!username.value || !email.value || !password.value || !repeatPassword.value) {
    formError.value = 'Popuni sva polja.'
    return
  }

  if (password.value !== repeatPassword.value) {
    formError.value = 'Lozinke se ne podudaraju.'
    repeatPassword.value = ''
    await nextTick()
    repeatPasswordInputRef.value?.focus()
    return
  }

  try {
    await auth.register({
      email: email.value,
      password: password.value,
      username: username.value,
    })

    const msg = 'Korisnik uspješno registriran. Molimo prijavite se.'

    successMessage.value = msg
    showSuccessModal.value = true
  } catch (e) {
    formError.value = extractMessage(e)
    password.value = ''
    repeatPassword.value = ''

    await nextTick()
    passwordInputRef.value?.focus()
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}

//helper funkcije za 'password strength' indikator
const passwordChecks = computed(() => {
  const value = password.value || ''

  return {
    minLength: value.length >= 8,
    hasLowercase: /[a-z]/.test(value),
    hasUppercase: /[A-Z]/.test(value),
    hasNumber: /\d/.test(value),
  }
})

const passedChecksCount = computed(() => {
  return Object.values(passwordChecks.value).filter(Boolean).length
})

const passwordStrength = computed(() => {
  const value = password.value || ''

  if (!value) {
    return {
      label: '',
      level: 0,
      widthClass: 'w-0',
      barClass: 'bg-transparent',
    }
  }

  if (passedChecksCount.value <= 2) {
    return {
      label: 'Slaba lozinka',
      level: 1,
      widthClass: 'w-1/3',
      barClass: 'bg-red-500',
    }
  }

  if (passedChecksCount.value <= 3) {
    return {
      label: 'Srednje jaka lozinka',
      level: 2,
      widthClass: 'w-2/3',
      barClass: 'bg-yellow-500',
    }
  }

  return {
    label: 'Jaka lozinka',
    level: 3,
    widthClass: 'w-full',
    barClass: 'bg-green-500',
  }
})
</script>

<template>
  <div class="flex justify-center mt-16">
    <BaseCard class="w-full max-w-md space-y-4">
      <h2 class="text-2xl font-bold text-center">Registracija</h2>

      <form class="space-y-4" @submit.prevent="submit">
        <BaseInput
          ref="usernameInputRef"
          label="Username"
          type="text"
          :modelValue="username"
          @update:modelValue="onUsernameInput"
        />

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

        <!--Password strength indikator-->
        <div v-if="password" class="space-y-2">
          <div class="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="[passwordStrength.widthClass, passwordStrength.barClass]"
            ></div>
          </div>

          <p
            class="text-sm font-medium"
            :class="{
              'text-red-600': passwordStrength.level === 1,
              'text-yellow-600': passwordStrength.level === 2,
              'text-green-600': passwordStrength.level === 3,
            }"
          >
            {{ passwordStrength.label }}
          </p>

          <ul class="text-sm space-y-1">
            <li :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-500'">
              • najmanje 8 znakova
            </li>
            <li :class="passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-500'">
              • barem jedno malo slovo
            </li>
            <li :class="passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-500'">
              • barem jedno veliko slovo
            </li>
            <li :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'">
              • barem jedan broj
            </li>
          </ul>
        </div>

        <BaseInput
          ref="repeatPasswordInputRef"
          label="Ponovi lozinku"
          type="password"
          :modelValue="repeatPassword"
          @update:modelValue="onRepeatPasswordInput"
        />

        <Transition name="fade-slide">
          <p v-if="formError" class="text-sm font-bold text-red-600 whitespace-pre-line">
            {{ formError }}
          </p>
        </Transition>

        <BaseButton class="w-full" :loading="auth.loading" type="submit"> Registracija </BaseButton>
      </form>

      <p class="text-sm text-center text-gray-600">
        Već imaš račun?
        <router-link class="text-blue-600 hover:underline" to="/login"> Prijavi se </router-link>
      </p>
    </BaseCard>
  </div>

  <InfoModal
    :show="showSuccessModal"
    title="Uspješna registracija"
    :message="successMessage"
    @close="closeSuccessModal"
  />
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
