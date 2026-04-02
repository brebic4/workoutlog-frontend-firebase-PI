import { defineStore } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import {
  apiRegister,
  apiLogin,
  apiLogout,
  apiForgotPassword,
  apiGetUserProfile,
  apiChangeUsername,
  apiChangePassword,
  apiLoginWithGoogle,
} from '../api/auth'
import { useWorkoutsStore } from './workouts'
import { useAdminStore } from './admin'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    firebaseUser: null,
    user: null,
    loading: false,
    error: null,
    sessionExpired: false,
    authReady: false,
  }),

  getters: {
    isLoggedIn: (s) => !!s.firebaseUser,
    isAdmin: (s) => s.user?.role === 'ADMIN',
    isGoogleUser: (s) => s.firebaseUser?.providerData?.some((p) => p.providerId === 'google.com'),
  },

  actions: {
    initAuthListener() {
      return new Promise((resolve) => {
        let resolved = false

        onAuthStateChanged(auth, async (firebaseUser) => {
          this.firebaseUser = firebaseUser
          this.error = null

          if (firebaseUser) {
            try {
              const profile = await apiGetUserProfile(firebaseUser.uid)
              this.user = profile
            } catch (e) {
              this.user = null
              this.error = e.message
            }
          } else {
            this.user = null
          }

          this.authReady = true

          if (!resolved) {
            resolved = true
            resolve()
          }
        })
      })
    },

    async register({ email, password, username }) {
      this.loading = true
      this.error = null

      try {
        const res = await apiRegister({ email, password, username })
        const profile = await apiGetUserProfile(res.user.uid)
        this.user = profile

        // odmah odjavi korisnika nakon registracije
        await apiLogout()
        this.firebaseUser = null
        this.user = null

        return res
      } catch (e) {
        this.error = e?.message || 'Registracija nije uspjela.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const res = await apiLogin({ email, password })
        const profile = await apiGetUserProfile(res.user.uid)
        this.user = profile
        return res
      } catch (e) {
        this.error = e?.message || 'Prijava nije uspjela.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle() {
      this.loading = true
      this.error = null

      try {
        const res = await apiLoginWithGoogle()
        const profile = await apiGetUserProfile(res.user.uid)
        this.user = profile
        return res
      } catch (e) {
        this.error = e?.message || 'Google prijava nije uspjela.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const workoutsStore = useWorkoutsStore()
      const adminStore = useAdminStore()

      await apiLogout()
      this.firebaseUser = null
      this.user = null

      workoutsStore.clearWorkouts()
      adminStore.clearAdminState()
    },

    async forgotPassword(email) {
      this.loading = true
      this.error = null

      try {
        await apiForgotPassword(email)
      } catch (e) {
        this.error = e?.message || 'Slanje reset emaila nije uspjelo.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async changeUsername(username) {
      if (!this.firebaseUser) {
        throw new Error('Korisnik nije prijavljen.')
      }

      this.loading = true
      this.error = null

      try {
        await apiChangeUsername(this.firebaseUser.uid, username)
        this.user = await apiGetUserProfile(this.firebaseUser.uid)
      } catch (e) {
        this.error = e?.message || 'Promjena username-a nije uspjela.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async changePassword(newPassword) {
      this.loading = true
      this.error = null

      try {
        await apiChangePassword(newPassword)
        await this.logout()
      } catch (e) {
        this.error = e?.message || 'Promjena lozinke nije uspjela.'
        throw e
      } finally {
        this.loading = false
      }
    },

    setSessionExpired(value) {
      this.sessionExpired = value
    },
  },
})
