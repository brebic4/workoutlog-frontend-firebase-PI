<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  workouts: {
    type: Array,
    default: () => [],
  },
})

const selectedDate = ref(new Date())
const resultsRef = ref(null)

function toYmd(value) {
  if (!value) return ''

  const d = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const selectedDateYmd = computed(() => toYmd(selectedDate.value))

const workoutsByDate = computed(() => {
  const map = new Map()

  for (const workout of props.workouts) {
    const key = workout?.date
    if (!key) continue

    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key).push(workout)
  }

  return map
})

const calendarAttributes = computed(() => {
  return Array.from(workoutsByDate.value.entries()).map(([date, items]) => ({
    key: date,
    dates: new Date(date),
    highlight: {
      color: 'blue',
      fillMode: 'light',
    },
    dot: {
      color: 'blue',
    },
    popover: {
      label: `${items.length} ${items.length === 1 ? 'trening' : 'treninga'}`,
    },
  }))
})

const workoutsForSelectedDate = computed(() => {
  return workoutsByDate.value.get(selectedDateYmd.value) || []
})

watch(
  () => props.workouts,
  (items) => {
    if (!items.length) return

    const hasSelectedDateWorkout = items.some((w) => w.date === selectedDateYmd.value)

    if (!hasSelectedDateWorkout) {
      selectedDate.value = new Date(items[0].date)
    }
  },
  { immediate: true },
)

watch(selectedDate, () => {
  setTimeout(() => {
    resultsRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, 50)
})

function formatDate(dateValue) {
  if (!dateValue) return ''

  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return String(dateValue)

  return d.toLocaleDateString('hr-HR')
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <VDatePicker
        v-model="selectedDate"
        :attributes="calendarAttributes"
        mode="date"
        expanded
        borderless
        transparent
        class="workout-calendar"
      />
    </div>

    <div
      ref="resultsRef"
      class="rounded-2xl scroll-offset border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h3 class="text-lg font-bold text-slate-800 dark:text-gray-100">
          Treninzi za {{ formatDate(selectedDateYmd) }}
        </h3>

        <span class="text-sm text-slate-500 dark:text-gray-400">
          {{ workoutsForSelectedDate.length }}
          {{ workoutsForSelectedDate.length === 1 ? 'trening' : 'treninga' }}
        </span>
      </div>

      <div v-if="workoutsForSelectedDate.length" class="space-y-3">
        <div
          v-for="workout in workoutsForSelectedDate"
          :key="workout.id"
          class="rounded-xl border border-slate-200 p-4 dark:border-gray-700"
        >
          <p class="font-semibold text-slate-800 dark:text-gray-100">
            {{ workout.type }}
          </p>

          <p class="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {{ workout.durationMin }} min
          </p>

          <p v-if="workout.notes" class="mt-2 text-sm text-slate-700 dark:text-gray-300">
            {{ workout.notes }}
          </p>
        </div>
      </div>

      <p v-else class="text-sm text-slate-500 dark:text-gray-400">
        Nema treninga za odabrani datum.
      </p>
    </div>
  </div>
</template>

<style scoped>
.workout-calendar :deep(.vc-container) {
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
}

.workout-calendar :deep(.vc-header) {
  margin-bottom: 10px;
}

.workout-calendar :deep(.vc-title) {
  font-weight: 700;
  color: inherit;
}

.workout-calendar :deep(.vc-weekday) {
  color: rgb(100 116 139);
  font-weight: 600;
}

.workout-calendar :deep(.vc-day-content) {
  border-radius: 12px;
}

.workout-calendar :deep(.vc-day) {
  min-height: 48px;
}

.scroll-offset {
  scroll-margin-top: 80px;
}
</style>
