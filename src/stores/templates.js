import { defineStore } from 'pinia'
import { apiGetTemplates, apiCreateTemplate, apiDeleteTemplate } from '../api/templates'

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    templates: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTemplates() {
      this.loading = true
      this.error = null

      try {
        const data = await apiGetTemplates()
        console.log('templatesStore.fetchTemplates -> data:', data)
        this.templates = Array.isArray(data) ? data : []
      } catch (e) {
        console.error('templatesStore.fetchTemplates -> error:', e)
        this.error = e?.message || 'Greška pri dohvaćanju templateova.'
      } finally {
        this.loading = false
      }
    },

    async createTemplate(payload) {
      this.loading = true
      this.error = null

      try {
        const created = await apiCreateTemplate(payload)
        this.templates = [created, ...this.templates]
        return created
      } catch (e) {
        console.error('templatesStore.createTemplate -> error:', e)
        this.error = e?.message || 'Greška pri spremanju templatea.'
        throw e
      } finally {
        this.loading = false
      }
    },

    async deleteTemplate(id) {
      this.error = null

      try {
        await apiDeleteTemplate(id)
        this.templates = this.templates.filter((t) => String(t.id) !== String(id))
      } catch (e) {
        console.error('templatesStore.deleteTemplate -> error:', e)
        this.error = e?.message || 'Greška pri brisanju templatea.'
        throw e
      }
    },

    clearTemplates() {
      this.templates = []
      this.error = null
    },
  },
})
