<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

import ConfirmModal from '../components/ui/ConfirmModal.vue'
import ChangePasswordModal from './ui/ChangePasswordModal.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ChangeUsernameModal from './ui/ChangeUsernameModal.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAdminRoute = computed(() => route.path === '/admin')
const isDashBoardVisible = computed(() => route.path === '/dashboard')

// Logout confirm
const showLogoutConfirm = ref(false)

const requestLogout = () => {
  showLogoutConfirm.value = true
}
const confirmLogout = async () => {
  await auth.logout()
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

const showUsernameModal = ref(false)
const usernameLoading = ref(false)

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

// Close dropdown on outside click
const onDocClick = (e) => {
  const el = e.target
  if (!el.closest?.('.profile-menu-wrapper')) {
    showProfileMenu.value = false
  }

  if (!el.closest?.('.mobile-nav-wrapper')) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const openChangePassword = () => {
  showProfileMenu.value = false
  showPwModal.value = true
}
const closePwModal = () => {
  showPwModal.value = false
}

const openChangeUsername = () => {
  showProfileMenu.value = false
  showUsernameModal.value = true
}

const closeUsernameModal = () => {
  showUsernameModal.value = false
}

const saveUsername = async (newUsername) => {
  usernameLoading.value = true

  try {
    await auth.changeUsername(newUsername)
    showUsernameModal.value = false
  } finally {
    usernameLoading.value = false
  }
}

const onPasswordChanged = () => {
  showPwModal.value = false
  router.push('/login')
}

const logoutFromMenu = () => {
  showProfileMenu.value = false
  requestLogout()
}

//Meni za Admin i Dashboard buttons za mobile
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<template>
  <header
    class="border-b bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800 transition-colors"
  >
    <div class="p-4 flex items-center justify-between">
      <router-link to="/workouts" class="font-bold text-3xl">WorkoutLog</router-link>

      <nav class="flex gap-4 items-center">
        <BaseButton v-if="!auth.isLoggedIn" as="router-link" to="/login"> Login </BaseButton>

        <BaseButton v-if="!auth.isLoggedIn" as="router-link" to="/register"> Register </BaseButton>

        <!-- samo kad je user ulogiran -->

        <!-- Desktop navigacija: od sm naviše -->
        <!--Admin-->
        <BaseButton
          v-if="auth.isLoggedIn && auth.isAdmin"
          as="router-link"
          :to="isAdminRoute ? '/workouts' : '/admin'"
          variant="secondary"
          class="hidden sm:inline-flex"
        >
          {{ isAdminRoute ? '← Workouts' : 'Admin' }}
        </BaseButton>

        <!--Dashboard-->
        <BaseButton
          v-if="auth.isLoggedIn"
          as="router-link"
          :to="isDashBoardVisible ? '/workouts' : '/dashboard'"
          variant="secondary"
          class="hidden sm:inline-flex"
        >
          {{ isDashBoardVisible ? '← Workouts' : 'Dashboard' }}
        </BaseButton>

        <div v-if="auth.isLoggedIn" class="profile-menu-wrapper flex items-center gap-3">
          <!-- Mobile menu: ispod sm -->
          <div v-if="auth.isLoggedIn" class="mobile-nav-wrapper sm:hidden relative">
            <BaseButton variant="secondary" @click.stop="toggleMobileMenu"> Menu </BaseButton>

            <div
              v-if="showMobileMenu"
              class="absolute -right-18 top-full mt-2 w-48 rounded-2xl border bg-white shadow-lg p-2 z-50 dark:bg-gray-900 dark:border-gray-700"
            >
              <div class="flex flex-col gap-2">
                <BaseButton
                  as="router-link"
                  to="/dashboard"
                  variant="secondary"
                  class="w-full"
                  @click="closeMobileMenu"
                >
                  Dashboard
                </BaseButton>

                <BaseButton
                  v-if="auth.isAdmin"
                  as="router-link"
                  to="/admin"
                  variant="secondary"
                  class="w-full"
                  @click="closeMobileMenu"
                >
                  Admin
                </BaseButton>
              </div>
            </div>
          </div>

          <BaseButton variant="secondary" @click.stop="toggleProfileMenu"> Profile </BaseButton>

          <div
            v-if="showProfileMenu"
            class="absolute right-2 top-15 w-75 bg-white border rounded-2xl shadow-lg p-2 z-50 dark:bg-gray-900 dark:border-gray-700"
          >
            <!-- Username -->
            <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              <div class="text-xs text-gray-400 dark:text-gray-500">Username</div>
              <div class="font-semibold break-all">{{ auth.user?.username || '-' }}</div>
            </div>

            <!-- Email -->
            <div class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              <div class="text-xs text-gray-400 dark:text-gray-500">Email</div>
              <div class="font-mono break-all">{{ auth.user?.email || '-' }}</div>
            </div>

            <div class="my-2 border-t dark:border-gray-700"></div>

            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              @click="openChangeUsername"
            >
              Promijeni username
            </button>

            <!-- Change password -->
            <button
              v-if="!auth.isGoogleUser"
              type="button"
              class="w-full text-left px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              @click="openChangePassword"
            >
              Promijeni lozinku
            </button>

            <!-- Logout (otvara ConfirmModal) -->
            <button
              type="button"
              class="w-full text-left px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition text-red-600 dark:text-red-400"
              @click="logoutFromMenu"
            >
              Logout
            </button>
          </div>
        </div>

        <!--Promjena teme - dark/light theme -->
        <BaseButton
          v-if="auth.isLoggedIn"
          variant="secondary"
          class="relative"
          @click="auth.toggleTheme"
        >
          {{ auth.currentTheme === 'dark' ? '☀️' : '🌙' }}
        </BaseButton>
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

  <ChangeUsernameModal
    :show="showUsernameModal"
    :currentUsername="auth.user?.username || ''"
    :loading="usernameLoading"
    @close="closeUsernameModal"
    @save="saveUsername"
  />
</template>
