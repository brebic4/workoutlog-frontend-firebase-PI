<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  show: Boolean,
  workout: Object,
  loading: Boolean,
})

const emit = defineEmits(['close', 'save'])

const type = ref('')
const durationMin = ref('')
const date = ref('')
const notes = ref('')
const error = ref('')

const typeRef = ref(null)

const fill = () => {
  const w = props.workout || {}
  type.value = w.type || ''
  durationMin.value = w.durationMin ?? w.duration ?? ''
  date.value = (w.date || '').slice?.(0, 10) || w.date || '' // ako je ISO string
  notes.value = w.notes || ''
  error.value = ''
}

watch(
  () => [props.show, props.workout],
  async ([show]) => {
    if (show) {
      fill()
      await nextTick()
      typeRef.value?.focus()
    }
  },
)

const submit = () => {
  error.value = ''

  if (!type.value || !durationMin.value || !date.value) {
    error.value = 'Type, trajanje i datum su obavezni.'
    return
  }

  const dur = Number(durationMin.value)
  if (!Number.isFinite(dur) || dur < 1 || dur > 600) {
    error.value = 'Trajanje mora biti broj od 1 do 600.'
    return
  }

  emit('save', {
    type: type.value,
    durationMin: dur,
    date: date.value,
    notes: notes.value,
  })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <BaseCard class="w-full max-w-lg space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold">Uredi workout</h2>
          <button class="text-gray-500 hover:text-gray-700" @click="emit('close')">✕</button>
        </div>

        <form class="space-y-3" @submit.prevent="submit">
          <BaseInput
            ref="typeRef"
            label="Type"
            :modelValue="type"
            @update:modelValue="
              (v) => {
                type = v
                if (error) error = ''
              }
            "
          />

          <BaseInput
            label="Trajanje (min)"
            type="number"
            :modelValue="durationMin"
            @update:modelValue="
              (v) => {
                durationMin = v
                if (error) error = ''
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
                if (error) error = ''
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
                if (error) error = ''
              }
            "
          />

          <Transition name="fade-slide">
            <p v-if="error" class="text-sm font-bold text-red-600">{{ error }}</p>
          </Transition>

          <div class="flex justify-end gap-3 pt-2">
            <BaseButton
              variant="secondary"
              type="button"
              @click="emit('close')"
              :disabled="loading"
            >
              Odustani
            </BaseButton>

            <BaseButton variant="primary" type="submit" :loading="loading">
              Spremi promjene
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
</style>
