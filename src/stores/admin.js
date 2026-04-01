import { defineStore } from 'pinia'
import {
  apiAdminGetWorkouts,
  apiAdminDeleteWorkout,
  apiAdminGetStats,
  apiAdminUpdateWorkout,
} from '../api/admin'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    workouts: [],
    stats: null,
    loadingWorkouts: false,
    loadingStats: false,
    error: null,
    statsRange: '30d',
  }),

  actions: {
    async fetchAdminWorkouts() {
      this.loadingWorkouts = true
      this.error = null

      try {
        const data = await apiAdminGetWorkouts()
        this.workouts = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e?.message || 'Greška pri dohvaćanju admin workouta.'
      } finally {
        this.loadingWorkouts = false
      }
    },

    async fetchAdminStats(range) {
      this.loadingStats = true
      this.error = null

      try {
        const r = range || this.statsRange || '30d'
        this.statsRange = r
        this.stats = await apiAdminGetStats(r)
      } catch (e) {
        this.error = e?.message || 'Greška pri dohvaćanju statistike (admin).'
      } finally {
        this.loadingStats = false
      }
    },

    async deleteAdminWorkout(id) {
      this.error = null

      try {
        await apiAdminDeleteWorkout(id)
        this.workouts = this.workouts.filter((w) => String(w.id) !== String(id))
      } catch (e) {
        this.error = e?.message || 'Greška pri brisanju workouta (admin).'
        throw e
      }
    },

    async updateAdminWorkout(id, payload) {
      this.error = null

      try {
        const data = await apiAdminUpdateWorkout(id, payload)

        const idx = this.workouts.findIndex((w) => String(w.id) === String(id))
        if (idx !== -1) {
          this.workouts[idx] = { ...this.workouts[idx], ...data }
        }

        return data
      } catch (e) {
        this.error = e?.message || 'Greška pri ažuriranju workouta (admin).'
        throw e
      }
    },

    clearAdminState() {
      this.workouts = []
      this.stats = null
      this.error = null
      this.statsRange = '30d'
    },
  },
})
