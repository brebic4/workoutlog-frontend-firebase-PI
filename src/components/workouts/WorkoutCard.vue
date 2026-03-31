<script setup>
import { ref } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import EditWorkoutModal from './EditWorkoutModal.vue'

const props = defineProps({
  workout: Object,
  highlighted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete', 'update'])

const showDeleteConfirm = ref(false)

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

const showEdit = ref(false)
const saving = ref(false)

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
</script>

<template>
  <div class="border rounded-xl p-4 bg-white shadow-sm" :class="highlighted ? 'flash' : ''">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="font-bold">{{ workout.type }}</p>
        <p class="text-sm text-gray-600">
          {{ formatDate(workout.date) }} • {{ workout.durationMin }} min
        </p>
        <p v-if="workout.notes" class="text-sm mt-2 text-gray-700">
          {{ workout.notes }}
        </p>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="secondary" @click="openEdit"> Update </BaseButton>

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
</template>

<style scoped>
.flash {
  animation: flash 900ms ease;
  border-color: rgba(59, 130, 246, 0.9); /* blue-500 */
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
