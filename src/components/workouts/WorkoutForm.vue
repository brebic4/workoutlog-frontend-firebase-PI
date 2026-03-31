<script setup>
import { ref, nextTick } from 'vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  onSubmit: {
    type: Function,
    required: true,
  },
})

const type = ref('')
const duration = ref('')
const date = ref('')
const notes = ref('')
const error = ref('')

const typeRef = ref(null)

const clearError = () => (error.value = '')

const submit = async () => {
  clearError()

  if (!type.value || !duration.value || !date.value) {
    error.value = 'Type, trajanje i datum su obavezni.'
    return
  }

  const dur = Number(duration.value)

  if (!Number.isFinite(dur) || dur < 1 || dur > 600) {
    error.value = 'Trajanje mora biti broj od 1 do 600.'
    return
  }

  const payload = {
    type: type.value,
    durationMin: dur,
    date: date.value,
    notes: notes.value,
  }

  const ok = await props.onSubmit(payload)

  if (!ok) return // ne resetiraj formu ako nije uspjelo

  type.value = ''
  duration.value = ''
  date.value = ''
  notes.value = ''

  await nextTick()
  typeRef.value?.focus()
}
</script>

<template>
  <BaseCard class="space-y-4">
    <h3 class="text-lg font-bold">Dodaj workout</h3>

    <form class="space-y-3" @submit.prevent="submit">
      <BaseInput
        ref="typeRef"
        label="Type (npr. Strength, Cardio)"
        :modelValue="type"
        @update:modelValue="
          (v) => {
            type = v
            if (error) clearError()
          }
        "
      />

      <BaseInput
        label="Trajanje (min)"
        type="number"
        :modelValue="duration"
        @update:modelValue="
          (v) => {
            duration = v
            if (error) clearError()
          }
        "
      />

      <BaseInput
        label="Datum"
        type="date"
        :modelValue="date"
        @update:modelValue="
          (v) => {
            date = v
            if (error) clearError()
          }
        "
      />

      <BaseInput
        label="Bilješke"
        textarea
        :modelValue="notes"
        @update:modelValue="
          (v) => {
            notes = v
            if (error) clearError()
          }
        "
      />

      <Transition name="fade-slide">
        <p v-if="error" class="text-sm font-bold text-red-600">{{ error }}</p>
      </Transition>

      <BaseButton class="w-full" type="submit"> Spremi </BaseButton>
    </form>
  </BaseCard>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
