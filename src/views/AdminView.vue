<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '../stores/admin'

import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import EditWorkoutModal from '../components/workouts/EditWorkoutModal.vue'

const admin = useAdminStore()

const filters = ref({
  email: '',
  type: '',
})

const showEditModal = ref(false)
const editTarget = ref(null)
const editLoading = ref(false)

const requestEdit = (w) => {
  editTarget.value = w
  showEditModal.value = true
}

const closeEdit = () => {
  showEditModal.value = false
  editTarget.value = null
}

const saveEdit = async (payload) => {
  if (!editTarget.value?.id) return
  editLoading.value = true
  try {
    await admin.updateAdminWorkout(editTarget.value.id, payload)
    // refresh lista + stats
    await Promise.all([admin.fetchAdminWorkouts(), admin.fetchAdminStats()])
    closeEdit()
  } finally {
    editLoading.value = false
  }
}

const ranges = [
  { key: '3d', label: '3D' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '3m', label: '3M' },
]

const setRange = async (r) => {
  await admin.fetchAdminStats(r)
}

const showDeleteConfirm = ref(false)
const deleteTargetId = ref(null)
const filtered = computed(() => {
  let list = [...(admin.workouts || [])]

  if (filters.value.email.trim()) {
    const q = filters.value.email.trim().toLowerCase()
    list = list.filter((w) =>
      String(w.userEmail || '')
        .toLowerCase()
        .includes(q),
    )
  }

  if (filters.value.type) {
    list = list.filter((w) => w.type === filters.value.type)
  }

  return list
})

onMounted(async () => {
  await Promise.all([admin.fetchAdminWorkouts(), admin.fetchAdminStats()])
})

const availableTypes = computed(() => {
  const set = new Set(admin.workouts.map((w) => w.type).filter(Boolean))
  return Array.from(set).sort()
})

const applyFilters = async () => {
  await admin.fetchAdminWorkouts(filters.value)
}

const requestDelete = (id) => {
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  const id = deleteTargetId.value
  showDeleteConfirm.value = false
  deleteTargetId.value = null

  if (!id) return

  try {
    await admin.deleteAdminWorkout(id)
    await Promise.all([admin.fetchAdminWorkouts(), admin.fetchAdminStats()])
  } catch {}
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTargetId.value = null
}

// helper: date format
const fmtDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString()
}

// stats helpers
const total = computed(() => admin.stats?.totalWorkouts ?? 0)
const totalMinutes = computed(() => admin.stats?.totalMinutes ?? 0)
const avgMinutes = computed(() => admin.stats?.avgMinutesPerWorkout ?? 0)

const topType = computed(() => admin.stats?.topType ?? '-')

const mostActive = computed(() => admin.stats?.mostActiveUser ?? null)

const durationBuckets = computed(() => admin.stats?.durationBuckets ?? [])

const typeBars = computed(() => {
  const arr = admin.stats?.byType || []
  const max = arr[0]?.count || 1
  return arr.slice(0, 6).map((x) => ({
    label: x._id ?? 'N/A',
    count: x.count ?? 0,
    pct: Math.round(((x.count ?? 0) / max) * 100),
  }))
})

const reset = async () => {
  filters.value = { email: '', type: '' }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-2xl font-bold">Admin</h2>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" size="md" @click="admin.fetchAdminWorkouts()">
            Refresh lista
          </BaseButton>

          <BaseButton variant="secondary" size="md" @click="admin.fetchAdminStats()">
            Refresh stats
          </BaseButton>
        </div>

        <div class="flex bg-gray-100 rounded-xl p-1 w-fit">
          <button
            v-for="r in ranges"
            :key="r.key"
            class="px-2 py-1 text-xs sm:px-3 sm:py-1 rounded-lg sm:text-sm"
            :class="admin.statsRange === r.key ? 'bg-white shadow font-bold' : 'text-gray-600'"
            @click="setRange(r.key)"
            type="button"
          >
            {{ r.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Errors -->
    <p v-if="admin.error" class="text-sm font-bold text-red-600">
      {{ admin.error }}
    </p>

    <!-- STATS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard>
        <p class="text-sm text-gray-600">Ukupno workouta</p>
        <p class="text-2xl font-bold">{{ total }}</p>
      </BaseCard>

      <BaseCard>
        <p class="text-sm text-gray-600">Najčešći type</p>
        <p class="text-2xl font-bold">{{ topType }}</p>
      </BaseCard>

      <BaseCard>
        <p class="text-sm text-gray-600">Ukupno minuta</p>
        <p class="text-2xl font-bold">{{ totalMinutes }}</p>
        <p class="text-xs text-gray-500 mt-1">Prosjek: {{ avgMinutes }} min/workout</p>
      </BaseCard>

      <BaseCard>
        <p class="text-sm text-gray-600">Najaktivniji user</p>
        <p class="text-sm font-mono" v-if="mostActive?.email">{{ mostActive.email }}</p>
        <p class="text-sm text-gray-600" v-else>-</p>
        <p class="text-xs text-gray-500 mt-1" v-if="mostActive">
          {{ mostActive.minutes }} min • {{ mostActive.workouts }} workouta
        </p>
      </BaseCard>
    </div>

    <!-- ByType distribution -->
    <BaseCard class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Raspodjela po tipu (Top 6)</h3>
      </div>

      <div v-if="admin.loadingStats" class="text-gray-600">Učitavanje statistike...</div>

      <div v-else class="space-y-2">
        <div v-for="b in typeBars" :key="b.label" class="space-y-1">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium">{{ b.label }}</span>
            <span class="text-gray-600">{{ b.count }}</span>
          </div>
          <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-2 bg-blue-500" :style="{ width: b.pct + '%' }"></div>
          </div>
        </div>

        <p v-if="!typeBars.length" class="text-gray-600 text-sm">Nema podataka.</p>
      </div>
    </BaseCard>

    <BaseCard class="space-y-3">
      <h3 class="text-lg font-bold">Trajanje workouta</h3>

      <div v-if="admin.loadingStats" class="text-gray-600">Učitavanje...</div>

      <div v-else class="overflow-x-auto border rounded-xl">
        <table class="min-w-105 w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Trajanje</th>
              <th class="text-right px-3 py-2 sm:px-4 sm:py-3">Broj workouta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in durationBuckets" :key="b.label" class="border-t">
              <td class="px-4 py-3 font-medium">{{ b.label }} min</td>
              <td class="px-4 py-3 text-right">{{ b.count }}</td>
            </tr>
            <tr v-if="!durationBuckets.length" class="border-t">
              <td class="px-4 py-3 text-gray-600" colspan="2">Nema podataka.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- FILTERS + TABLE -->
    <BaseCard class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">Svi treninzi</h3>
        <p class="text-sm text-gray-600">Prikaz: {{ filtered.length }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Filter email</label>
          <input
            v-model="filters.email"
            class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2"
            placeholder="example@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Filter type</label>
          <select
            class="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
            v-model="filters.type"
          >
            <option value="">Svi</option>
            <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="flex items-end sm:justify-end">
          <BaseButton variant="secondary" class="w-full sm:w-auto" @click="reset">
            Reset filtera
          </BaseButton>
        </div>
      </div>

      <div class="overflow-x-auto border rounded-xl">
        <table class="min-w-225 w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Datum</th>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Email</th>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Type</th>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Trajanje</th>
              <th class="text-left px-3 py-2 sm:px-4 sm:py-3">Bilješke</th>
              <th class="text-right px-3 py-2 sm:px-4 sm:py-3">Akcije</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="admin.loadingWorkouts">
              <td class="px-4 py-3 text-gray-600" colspan="6">Učitavanje...</td>
            </tr>

            <tr v-else-if="!filtered.length">
              <td class="px-4 py-3 text-gray-600" colspan="6">Nema rezultata.</td>
            </tr>

            <tr v-else v-for="w in filtered" :key="w.id" class="border-t">
              <td class="px-4 py-3">{{ fmtDate(w.date) }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ w.userEmail || '-' }}</td>
              <td class="px-4 py-3 font-medium">{{ w.type }}</td>
              <td class="px-4 py-3">{{ w.durationMin }} min</td>
              <td class="px-4 py-3 max-w-90 truncate">{{ w.notes }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex flex-col sm:flex-row justify-end gap-2">
                  <BaseButton variant="secondary" size="sm" @click="requestEdit(w)">
                    Update
                  </BaseButton>
                  <BaseButton variant="danger" size="sm" @click="requestDelete(w.id)">
                    Delete
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Admin brisanje"
      message="Jeste li sigurni da želite obrisati ovaj workout?"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <EditWorkoutModal
      :show="showEditModal"
      :workout="editTarget"
      :loading="editLoading"
      @close="closeEdit"
      @save="saveEdit"
    />
  </div>
</template>
