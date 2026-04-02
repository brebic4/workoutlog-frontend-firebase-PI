<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { getAuthErrorMessage } from '@/utils/authErrorMessages'

import ConfirmModal from './ConfirmModal.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'success'])
const auth = useAuthStore()

const newPassword = ref('')
const confirmNewPassword = ref('')

const error = ref('')
const loading = ref(false)

const showConfirm = ref(false)

const showNew = ref(false)
const showConfirmPw = ref(false)

const showSuccess = ref(false)
const successMessage = ref('')

const successTimer = ref(null)

const toggleNew = () => (showNew.value = !showNew.value)
const toggleConfirm = () => (showConfirmPw.value = !showConfirmPw.value)

watch(
  () => props.show,
  (v) => {
    if (v) {
      // reset kad se otvori
      newPassword.value = ''
      confirmNewPassword.value = ''
      error.value = ''
      loading.value = false
      showConfirm.value = false
      showNew.value = false
      showConfirmPw.value = false
      showSuccess.value = false
      successMessage.value = ''

      if (successTimer.value) {
        clearTimeout(successTimer.value)
        successTimer.value = null
      }
    }
  },
)

watch([newPassword, confirmNewPassword], () => {
  if (error.value) {
    error.value = ''
  }
})

onBeforeUnmount(() => {
  if (successTimer.value) clearTimeout(successTimer.value)
})

const close = () => {
  if (loading.value) return
  emit('close')
}

const requestSubmit = () => {
  error.value = ''

  if (!newPassword.value) {
    error.value = 'Unesi novu lozinku.'
    return
  }

  if (newPassword.value !== confirmNewPassword.value) {
    error.value = 'Nova lozinka i potvrda se ne podudaraju.'
    return
  }

  if (!isPasswordValid.value) {
    error.value = 'Lozinka mora zadovoljiti sva sigurnosna pravila.'
    return
  }

  showConfirm.value = true
}

const confirmSubmit = async () => {
  showConfirm.value = false
  loading.value = true
  error.value = ''

  try {
    await auth.changePassword(newPassword.value)

    successMessage.value = 'Lozinka uspješno promijenjena.'
    showSuccess.value = true

    if (successTimer.value) clearTimeout(successTimer.value)
    successTimer.value = setTimeout(() => {
      closeSuccess()
    }, 2000)
  } catch (e) {
    error.value = getAuthErrorMessage(e, 'Greška pri promjeni lozinke.')
  } finally {
    loading.value = false
  }
}

const cancelConfirm = () => {
  showConfirm.value = false
}

const closeSuccess = () => {
  if (successTimer.value) {
    clearTimeout(successTimer.value)
    successTimer.value = null
  }
  showSuccess.value = false
  emit('success') // Navbar redirect na /login
}

const passwordChecks = computed(() => {
  const value = newPassword.value || ''

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
  const value = newPassword.value || ''

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

const isPasswordValid = computed(() => passwordStrength.value.level === 3)
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
      <div class="flex items-start justify-between gap-4">
        <h2 class="text-xl font-bold">Promijeni lozinku</h2>
        <button class="text-gray-500 cursor-pointer hover:text-gray-700" @click="close">✕</button>
      </div>

      <div class="mt-4 space-y-3">
        <div>
          <label class="block text-sm text-gray-600 mb-1">Nova lozinka</label>

          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              class="w-full border rounded-xl px-3 py-2 pr-12"
              autocomplete="new-password"
            />

            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
              @click="toggleNew"
              :aria-label="showNew ? 'Sakrij lozinku' : 'Prikaži lozinku'"
            >
              <!-- Eye (show) -->
              <svg
                v-if="!showNew"
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

              <!-- Eye-off (hide) -->
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

          <div v-if="newPassword" class="mt-2 space-y-2">
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

            <ul class="text-xs space-y-1">
              <li :class="passwordChecks.minLength ? 'text-green-600' : 'text-gray-500'">
                • najmanje 8 znakova
              </li>
              <li :class="passwordChecks.hasLowercase ? 'text-green-600' : 'text-gray-500'">
                • malo slovo
              </li>
              <li :class="passwordChecks.hasUppercase ? 'text-green-600' : 'text-gray-500'">
                • veliko slovo
              </li>
              <li :class="passwordChecks.hasNumber ? 'text-green-600' : 'text-gray-500'">• broj</li>
            </ul>
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Potvrdi novu lozinku</label>

          <div class="relative">
            <input
              v-model="confirmNewPassword"
              :type="showConfirmPw ? 'text' : 'password'"
              class="w-full border rounded-xl px-3 py-2 pr-12"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg cursor-pointer hover:bg-gray-100"
              @click="toggleConfirm"
              :aria-label="showConfirmPw ? 'Sakrij lozinku' : 'Prikaži lozinku'"
            >
              <svg
                v-if="!showConfirmPw"
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
        </div>

        <p v-if="error" class="text-sm text-red-600 whitespace-pre-line">{{ error }}</p>

        <div class="flex justify-end gap-2 pt-2">
          <BaseButton type="button" variant="secondary" @click="close" :disabled="loading">
            Odustani
          </BaseButton>

          <BaseButton type="button" @click="requestSubmit" :disabled="loading">
            {{ loading ? 'Spremam...' : 'Spremi' }}
          </BaseButton>
        </div>

        <p class="text-xs text-gray-500">
          Nakon promjene lozinke bit ćeš automatski odjavljen i morat ćeš se ponovno prijaviti.
        </p>
      </div>
    </div>

    <ConfirmModal
      :show="showConfirm"
      title="Promjena lozinke"
      message="Jeste li sigurni da želite promijeniti lozinku? Nakon promjene bit ćete odjavljeni i morat ćete se ponovno prijaviti."
      @confirm="confirmSubmit"
      @cancel="cancelConfirm"
    />

    <ConfirmModal
      :show="showSuccess"
      title="Uspjeh"
      :message="successMessage"
      singleButton
      @confirm="closeSuccess"
    />
  </div>
</template>
