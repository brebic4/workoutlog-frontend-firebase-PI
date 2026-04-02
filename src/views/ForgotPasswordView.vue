<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import InfoModal from '../components/ui/InfoModal.vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const formError = ref('')
const emailInputRef = ref(null)

const showSuccessModal = ref(false)
const successMessage = ref('')

const clearError = () => {
  formError.value = ''
}

const onEmailInput = (val) => {
  email.value = val
  if (formError.value) clearError()
}

onMounted(async () => {
  await nextTick()
  emailInputRef.value?.focus()
})

//Preventivno - Firebase sigurnosni mehanizam šalje reset i kada je krivi email
const extractMessage = (e) => {
  const msg = e?.message || ''

  if (msg.includes('auth/user-not-found')) {
    return 'Korisnik s ovim emailom ne postoji.'
  }

  if (msg.includes('auth/invalid-email')) {
    return 'Email nije ispravan.'
  }

  if (msg.includes('auth/too-many-requests')) {
    return 'Previše pokušaja. Pokušaj ponovno kasnije.'
  }

  return auth.error || e?.message || 'Slanje reset emaila nije uspjelo.'
}

const submit = async () => {
  clearError()

  if (!email.value) {
    formError.value = 'Unesi email adresu.'
    return
  }

  try {
    await auth.forgotPassword(email.value)
    successMessage.value = 'Poslali smo email za reset lozinke. Provjeri svoj inbox.'
    showSuccessModal.value = true
  } catch (e) {
    formError.value = extractMessage(e)
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<template>
  <div class="flex justify-center mt-16">
    <BaseCard class="w-full max-w-md space-y-4">
      <h2 class="text-2xl font-bold text-center">Forgot password</h2>

      <p class="text-sm text-gray-600 text-center">
        Unesi email adresu i poslat ćemo ti link za promjenu lozinke.
      </p>

      <form class="space-y-4" @submit.prevent="submit">
        <BaseInput
          ref="emailInputRef"
          label="Email"
          type="email"
          :modelValue="email"
          @update:modelValue="onEmailInput"
        />

        <Transition name="fade-slide">
          <p v-if="formError" class="text-sm font-bold text-red-600">
            {{ formError }}
          </p>
        </Transition>

        <BaseButton class="w-full" :loading="auth.loading" type="submit">
          Pošalji reset link
        </BaseButton>
      </form>

      <p class="text-sm text-center text-gray-600">
        Sjetio si se lozinke?
        <router-link class="text-blue-600 hover:underline" to="/login">
          Povratak na login
        </router-link>
      </p>
    </BaseCard>
  </div>

  <InfoModal
    :show="showSuccessModal"
    title="Reset lozinke"
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
