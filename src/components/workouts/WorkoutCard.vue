<script setup>
import { ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import EditWorkoutModal from './EditWorkoutModal.vue'
import SaveAsTemplateModal from './SaveAsTemplateModal.vue'
import { useTemplatesStore } from '../../stores/templates'

const props = defineProps({
  workout: Object,
  highlighted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete', 'update'])

const ts = useTemplatesStore()

const showDeleteConfirm = ref(false)
const showEdit = ref(false)
const saving = ref(false)

const showTemplateModal = ref(false)
const templateLoading = ref(false)

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date.getTime()) ? String(d) : date.toLocaleDateString()
}

const requestDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  showDeleteConfirm.value = false
  emit('delete', props.workout?.id)
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const openEdit = () => {
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const saveEdit = async (payload) => {
  saving.value = true
  try {
    await emit('update', { id: props.workout?.id ?? props.workout?._id, payload })
    showEdit.value = false
  } finally {
    saving.value = false
  }
}

const openTemplateModal = () => {
  showTemplateModal.value = true
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
}

const saveAsTemplate = async (templateName) => {
  templateLoading.value = true

  try {
    await ts.createTemplate({
      name: templateName,
      type: props.workout?.type || '',
      durationMin: props.workout?.durationMin || 0,
      notes: props.workout?.notes || '',
    })

    showTemplateModal.value = false
  } finally {
    templateLoading.value = false
  }
}
</script>

<template>
  <div
    class="border rounded-xl p-4 bg-white shadow-sm text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    :class="highlighted ? 'flash' : ''"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="font-bold">{{ workout.type }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ formatDate(workout.date) }} • {{ workout.durationMin }} min
        </p>
        <p v-if="workout.notes" class="text-sm mt-2 text-gray-700 dark:text-gray-300">
          {{ workout.notes }}
        </p>
      </div>

      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton variant="secondary" @click="openEdit"> Update </BaseButton>
        <BaseButton variant="secondary" @click="openTemplateModal"> Save as template </BaseButton>
        <BaseButton variant="danger" @click="requestDelete"> Delete </BaseButton>
      </div>

      <EditWorkoutModal
        :show="showEdit"
        :workout="workout"
        :loading="saving"
        @close="closeEdit"
        @save="saveEdit"
      />
    </div>
  </div>

  <ConfirmModal
    :show="showDeleteConfirm"
    title="Brisanje workouta"
    message="Jeste li sigurni da želite obrisati ovaj workout?"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />

  <SaveAsTemplateModal
    :show="showTemplateModal"
    :defaultName="`${workout?.type || 'Workout'} - ${workout?.durationMin || 0} min`"
    :loading="templateLoading"
    @close="closeTemplateModal"
    @save="saveAsTemplate"
  />
</template>

<style scoped>
.flash {
  animation: flash 900ms ease;
  border-color: rgba(59, 130, 246, 0.9);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

@keyframes flash {
  0% {
    background: rgba(59, 130, 246, 0.18);
    transform: scale(1.01);
  }
  60% {
    background: rgba(59, 130, 246, 0.08);
    transform: scale(1);
  }
  100% {
    background: transparent;
  }
}
</style>
