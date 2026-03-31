<script setup>
import { useAuthStore } from '../stores/auth'
import BaseButton from '../components/ui/BaseButton.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import ChangePasswordModal from './ui/ChangePasswordModal.vue'

const auth = useAuthStore()
const router = useRouter()

// Logout confirm
const showLogoutConfirm = ref(false)

const requestLogout = () => {
  showLogoutConfirm.value = true
}
const confirmLogout = () => {
  auth.logout()
  showLogoutConfirm.value = false
  router.push('/login')
}

const cancelLogout = () => {
  showLogoutConfirm.value = false
}

// Profile dropdown
const showPwModal = ref(false)

// Profile dropdown state
const showProfileMenu = ref(false)

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

// Close dropdown on outside click
const onDocClick = (e) => {
  const el = e.target
  if (!el.closest?.('.profile-menu-wrapper')) {
    showProfileMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const openChangePassword = () => {
  showProfileMenu.value = false
  showPwModal.value = true
}
const closePwModal = () => {
  showPwModal.value = false
}
const onPasswordChanged = () => {
  showPwModal.value = false
  router.push('/login')
}

const logoutFromMenu = () => {
  showProfileMenu.value = false
  requestLogout()
}
</script>

<template>
  <header class="border-b">
    <div class="p-4 flex items-center justify-between">
      <router-link to="/workouts" class="font-bold text-3xl">WorkoutLog</router-link>

      <nav class="flex gap-4 items-center">
        <BaseButton v-if="!auth.isLoggedIn" as="router-link" to="/login"> Login </BaseButton>

        <BaseButton v-if="!auth.isLoggedIn" as="router-link" to="/register"> Register </BaseButton>

        <BaseButton
          v-if="auth.isLoggedIn && auth.isAdmin"
          as="router-link"
          to="/admin"
          variant="secondary"
        >
          Admin
        </BaseButton>

        <!-- PROFILE DROPDOWN (samo kad je user ulogiran) -->
        <div v-if="auth.isLoggedIn" class="profile-menu-wrapper relative flex items-center gap-3">
          <BaseButton variant="secondary" @click.stop="toggleProfileMenu"> Profile </BaseButton>

          <div
            v-if="showProfileMenu"
            class="absolute right-0 top-12 w-72 bg-white border rounded-2xl shadow-lg p-2 z-50"
          >
            <!-- Email -->
            <div class="px-3 py-2 text-sm text-gray-600">
              <div class="text-xs text-gray-400">Email</div>
              <div class="font-mono break-all">{{ auth.user?.email || '-' }}</div>
            </div>

            <div class="my-2 border-t"></div>

            <!-- Change password -->
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition"
              @click="openChangePassword"
            >
              Promijeni lozinku
            </button>

            <!-- Logout (otvara ConfirmModal) -->
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition text-red-600"
              @click="logoutFromMenu"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <ConfirmModal
    :show="showLogoutConfirm"
    title="Odjava"
    message="Jeste li sigurni da se želite odjaviti?"
    @confirm="confirmLogout"
    @cancel="cancelLogout"
  />

  <ChangePasswordModal :show="showPwModal" @close="closePwModal" @success="onPasswordChanged" />
</template>
