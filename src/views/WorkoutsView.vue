<script setup>
import { onMounted, computed, ref } from 'vue'
import { useWorkoutsStore } from '../stores/workouts'
import { useAuthStore } from '@/stores/auth'

import WorkoutForm from '../components/workouts/WorkoutForm.vue'
import WorkoutList from '../components/workouts/WorkoutList.vue'
import WorkoutsToolbar from '../components/workouts/WorkoutsToolbar.vue'
import WorkoutCalendar from '../components/workouts/WorkoutCalendar.vue'

const ws = useWorkoutsStore()
const auth = useAuthStore()

const mobileTab = ref('list') // 'form' | 'list'
const workoutsViewMode = ref('list') // 'list' | 'calendar'

onMounted(() => {
  ws.fetchWorkouts()
})

const onCreate = async (payload) => {
  try {
    await ws.createWorkout(payload)
    return true
  } catch {
    return false
  }
}

const onDelete = async (id) => {
  try {
    await ws.deleteWorkout(id)
  } catch {}
}

const onUpdate = async ({ id, payload }) => {
  try {
    await ws.updateWorkout(id, payload)
  } catch {}
}

const filters = ref({
  types: [],
  dateFrom: '',
  dateTo: '',
  minDur: '',
  maxDur: '',
  sort: 'newest',
})

const availableTypes = computed(() => {
  const set = new Set(ws.workouts.map((w) => w.type).filter(Boolean))
  return Array.from(set).sort()
})

const filteredWorkouts = computed(() => {
  const f = filters.value

  let list = [...ws.workouts]

  // type
  if (f.types?.length) {
    const set = new Set(f.types)
    list = list.filter((w) => set.has(w.type))
  }

  // date range
  const from = f.dateFrom ? new Date(f.dateFrom) : null
  const to = f.dateTo ? new Date(f.dateTo) : null

  if (from) list = list.filter((w) => new Date(w.date) >= from)
  if (to) {
    const end = new Date(to)
    end.setHours(23, 59, 59, 999)
    list = list.filter((w) => new Date(w.date) <= end)
  }

  // duration
  const minDur = f.minDur !== '' ? Number(f.minDur) : null
  const maxDur = f.maxDur !== '' ? Number(f.maxDur) : null

  if (minDur !== null) list = list.filter((w) => Number(w.durationMin) >= minDur)
  if (maxDur !== null) list = list.filter((w) => Number(w.durationMin) <= maxDur)

  // sort
  list.sort((a, b) => new Date(a.date) - new Date(b.date))
  if (f.sort === 'newest') list.reverse()

  return list
})
</script>

<template>
  <div class="px-0 mb-4">
    <h1 class="text-xl sm:text-2xl md:text-3xl font-bold">
      Dobro došao,
      <span class="text-blue-600">
        {{ auth.user?.username || 'korisniče' }}
      </span>
    </h1>
  </div>

  <!-- Mobile/Tablet tabs -->
  <div class="mb-4 flex gap-2 lg:hidden">
    <button
      class="flex-1 rounded-lg border px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold cursor-pointer transition-colors"
      :class="
        mobileTab === 'form'
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700'
      "
      @click="mobileTab = 'form'"
    >
      Dodaj
    </button>

    <button
      class="flex-1 rounded-lg border px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold cursor-pointer"
      :class="
        mobileTab === 'list'
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700'
      "
      @click="mobileTab = 'list'"
    >
      Moji workouti
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1" :class="mobileTab === 'form' ? 'block' : 'hidden lg:block'">
      <WorkoutForm :onSubmit="onCreate" />
    </div>

    <div
      class="lg:col-span-2 overflow-hidden min-h-0 h-[calc(100dvh-200px)] lg:h-[calc(100vh-160px)] grid grid-rows-[auto,1fr]"
      :class="mobileTab === 'list' ? 'grid' : 'hidden lg:grid'"
    >
      <WorkoutsToolbar
        v-model="filters"
        :availableTypes="availableTypes"
        :viewMode="workoutsViewMode"
        @update:viewMode="workoutsViewMode = $event"
        class="mb-4"
      />

      <!-- 2. red: lista dobiva sav preostali prostor + skrol -->
      <div class="min-h-0 overflow-y-auto pr-2">
        <WorkoutList
          v-if="workoutsViewMode === 'list'"
          :workouts="filteredWorkouts"
          :loading="ws.loading"
          :error="ws.error"
          :highlightId="ws.highlightId"
          @delete="onDelete"
          @update="onUpdate"
        />

        <WorkoutCalendar v-else :workouts="filteredWorkouts" />
      </div>
    </div>
  </div>
</template>
