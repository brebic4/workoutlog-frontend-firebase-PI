<script setup>
import InfoModal from './components/ui/InfoModal.vue'
import Navbar from './components/Navbar.vue'

import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const handleSessionExpiredClose = async () => {
  auth.setSessionExpired(false)
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors"
  >
    <Navbar />
    <main class="p-6">
      <router-view />

      <InfoModal
        :show="auth.sessionExpired"
        title="Sesija istekla"
        message="Sesija je istekla. Molimo prijavite se ponovno."
        @close="handleSessionExpiredClose"
      />
    </main>
  </div>
</template>
