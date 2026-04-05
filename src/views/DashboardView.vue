<script setup>
import { computed, onMounted } from 'vue'
import BaseCard from '../components/ui/BaseCard.vue'
import { useWorkoutsStore } from '../stores/workouts'

const ws = useWorkoutsStore()

onMounted(async () => {
  if (!ws.workouts.length) {
    await ws.fetchWorkouts()
  }
})

const workouts = computed(() => {
  return [...ws.workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalWorkouts = computed(() => workouts.value.length)

const totalMinutes = computed(() => {
  return workouts.value.reduce((sum, workout) => {
    return sum + (Number(workout.durationMin) || 0)
  }, 0)
})

const averageDuration = computed(() => {
  if (!workouts.value.length) return 0
  return Math.round(totalMinutes.value / workouts.value.length)
})

const workoutTypeCounts = computed(() => {
  const counts = {}

  for (const workout of workouts.value) {
    const type = workout.type || 'Ostalo'
    counts[type] = (counts[type] || 0) + 1
  }

  return counts
})

const mostFrequentType = computed(() => {
  const entries = Object.entries(workoutTypeCounts.value)

  if (!entries.length) return '-'

  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
})

const workoutsLast7Days = computed(() => {
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  return workouts.value.filter((workout) => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= sevenDaysAgo && workoutDate <= today
  }).length
})

const workoutsLast30Days = computed(() => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  return workouts.value.filter((workout) => {
    const workoutDate = new Date(workout.date)
    return workoutDate >= thirtyDaysAgo && workoutDate <= today
  }).length
})

const workoutsByType = computed(() => {
  return Object.entries(workoutTypeCounts.value)
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalWorkouts.value ? Math.round((count / totalWorkouts.value) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
})

const recentWorkouts = computed(() => workouts.value.slice(0, 5))

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('hr-HR')
}
</script>

<template>
  <div v-if="ws.loading" class="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
    Učitavanje statistike...
  </div>

  <div v-else-if="ws.error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
    {{ ws.error }}
  </div>

  <div v-else class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Moj dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Pregled statistike i aktivnosti treninga.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <BaseCard class="p-5">
        <p class="text-sm font-medium text-slate-500">Ukupno treninga</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">
          {{ totalWorkouts }}
        </p>
      </BaseCard>

      <BaseCard class="p-5">
        <p class="text-sm font-medium text-slate-500">Ukupno minuta</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">
          {{ totalMinutes }}
        </p>
      </BaseCard>

      <BaseCard class="p-5">
        <p class="text-sm font-medium text-slate-500">Prosječno trajanje</p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ averageDuration }} min</p>
      </BaseCard>

      <BaseCard class="p-5">
        <p class="text-sm font-medium text-slate-500">Najčešći tip</p>
        <p class="mt-2 text-2xl font-bold text-slate-800">
          {{ mostFrequentType }}
        </p>
      </BaseCard>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BaseCard class="p-5">
        <h2 class="text-lg font-semibold text-slate-800">Aktivnost</h2>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Zadnjih 7 dana</p>
            <p class="mt-2 text-2xl font-bold text-slate-800">
              {{ workoutsLast7Days }}
            </p>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-sm text-slate-500">Zadnjih 30 dana</p>
            <p class="mt-2 text-2xl font-bold text-slate-800">
              {{ workoutsLast30Days }}
            </p>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="p-5">
        <h2 class="text-lg font-semibold text-slate-800">Raspodjela po tipu</h2>

        <div v-if="workoutsByType.length" class="mt-4 space-y-4">
          <div v-for="item in workoutsByType" :key="item.type">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="font-medium text-slate-700">{{ item.type }}</span>
              <span class="text-slate-500"> {{ item.count }} ({{ item.percentage }}%) </span>
            </div>

            <div class="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-blue-500 transition-all duration-300"
                :style="{ width: `${item.percentage}%` }"
              />
            </div>
          </div>
        </div>

        <p v-else class="mt-4 text-sm text-slate-500">Nema podataka za prikaz.</p>
      </BaseCard>
    </div>

    <BaseCard class="p-5">
      <h2 class="text-lg font-semibold text-slate-800">Zadnjih 5 treninga</h2>

      <div v-if="recentWorkouts.length" class="mt-4 space-y-3">
        <div
          v-for="workout in recentWorkouts"
          :key="workout.id"
          class="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="font-semibold text-slate-800">
              {{ workout.type || 'Bez tipa' }}
            </p>
            <p class="text-sm text-slate-500">
              {{ formatDate(workout.date) }}
            </p>
          </div>

          <div class="text-sm text-slate-600">{{ workout.durationMin || 0 }} min</div>
        </div>
      </div>

      <p v-else class="mt-4 text-sm text-slate-500">Još nema treninga za prikaz.</p>
    </BaseCard>
  </div>
</template>
