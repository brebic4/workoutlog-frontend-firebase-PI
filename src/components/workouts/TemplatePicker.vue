<script setup>
import { ref } from 'vue'
import { useTemplatesStore } from '../../stores/templates'
import BaseButton from '../ui/BaseButton.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'

const ts = useTemplatesStore()

const emit = defineEmits(['use-template'])

const open = ref(false)
const showDeleteConfirm = ref(false)
const templateToDelete = ref(null)

const toggleOpen = () => {
  open.value = !open.value
}

const useTemplate = (template) => {
  emit('use-template', template)
  open.value = false
}

const requestDeleteTemplate = (template) => {
  templateToDelete.value = template
  showDeleteConfirm.value = true
}

const confirmDeleteTemplate = async () => {
  if (!templateToDelete.value) return

  try {
    await ts.deleteTemplate(templateToDelete.value.id)
  } catch (e) {
    console.error(e)
  } finally {
    showDeleteConfirm.value = false
    templateToDelete.value = null
  }
}

const cancelDeleteTemplate = () => {
  showDeleteConfirm.value = false
  templateToDelete.value = null
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col justify-center gap-3">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-gray-200">Templates</h3>

      <BaseButton
        variant="secondary"
        type="button"
        class="flex items-center justify-between gap-2 w-full sm:w-auto px-4 py-2"
        @click="toggleOpen"
      >
        <span class="text-sm font-medium">
          Odaberi template <span v-if="ts.templates.length">({{ ts.templates.length }})</span>
        </span>

        <span class="text-xs transition-transform duration-200" :class="open ? 'rotate-180' : ''">
          ▼
        </span>
      </BaseButton>
    </div>

    <div
      v-if="open"
      class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div v-if="ts.loading" class="text-sm text-slate-500 dark:text-gray-400">
        Učitavanje templateova...
      </div>

      <div v-else-if="ts.error" class="text-sm font-semibold text-red-600 dark:text-red-400">
        {{ ts.error }}
      </div>

      <div v-else-if="ts.templates.length" class="space-y-2">
        <div
          v-for="template in ts.templates"
          :key="template.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-gray-700"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-800 dark:text-gray-100">
              {{ template.name }}
            </p>
            <p class="text-sm text-slate-500 dark:text-gray-400">
              {{ template.type || 'Bez tipa' }} • {{ template.durationMin || 0 }} min
            </p>
          </div>

          <div class="flex shrink-0 gap-2">
            <BaseButton variant="secondary" type="button" @click="useTemplate(template)">
              Use
            </BaseButton>

            <BaseButton variant="danger" type="button" @click="requestDeleteTemplate(template)">
              Delete
            </BaseButton>
          </div>
        </div>
      </div>

      <p v-else class="text-sm text-slate-500 dark:text-gray-400">Nema spremljenih templateova.</p>

      <ConfirmModal
        :show="showDeleteConfirm"
        title="Brisanje templatea"
        :message="`Jeste li sigurni da želite obrisati template '${templateToDelete?.name || ''}'?`"
        @confirm="confirmDeleteTemplate"
        @cancel="cancelDeleteTemplate"
      />
    </div>
  </div>
</template>
