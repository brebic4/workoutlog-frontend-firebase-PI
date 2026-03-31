<script setup>
import InfoModal from './components/ui/InfoModal.vue'
import Navbar from './components/Navbar.vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSessionExpiredClose = () => {
  auth.setSessionExpired(false)
  auth.logout()
  router.push('/login')
}

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen">
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
