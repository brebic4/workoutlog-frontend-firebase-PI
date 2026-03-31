<script setup>
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: Object,
  availableTypes: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const showFiltersMobile = ref(false)

const update = (patch) => {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const reset = () => {
  emit('update:modelValue', {
    type: [],
    dateFrom: '',
    dateTo: '',
    minDur: '',
    maxDur: '',
    sort: 'newest',
  })
  showFiltersMobile.value = false
  openTypes.value = false
}

const openTypes = ref(false)

const toggleType = (t) => {
  const current = props.modelValue.types || []
  const exists = current.includes(t)
  const next = exists ? current.filter((x) => x !== t) : [...current, t]
  update({ types: next })
}

const clearTypes = () => update({ types: [] })
const selectAllTypes = () => update({ types: [...props.availableTypes] })

const typesLabel = computed(() => {
  const selected = props.modelValue.types || []
  if (!selected.length) return 'Svi'
  if (selected.length === 1) return selected[0]
  return `${selected.length} odabrano`
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- MOBILE/TABLET HEADER: Filteri toggle + Sort + Reset -->
    <div class="flex items-center justify-between gap-2 lg:hidden">
      <button
        type="button"
        class="rounded-full border px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-semibold cursor-pointer"
        @click="showFiltersMobile = !showFiltersMobile"
      >
        {{ showFiltersMobile ? 'Sakrij filtere' : 'Prikaži filtere' }}
      </button>

      <div class="flex gap-2 items-center">
        <select
          class="border rounded-full px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm cursor-pointer"
          :value="modelValue.sort"
          @change="update({ sort: $event.target.value })"
        >
          <option value="newest">Najnoviji</option>
          <option value="oldest">Najstariji</option>
        </select>

        <BaseButton variant="secondary" @click="reset">Reset</BaseButton>
      </div>
    </div>

    <!-- FILTER INPUTI:
         - Na mob/tablet: prikaz samo kad je showFiltersMobile=true
         - Na lg+: uvijek prikaz -->
    <div :class="showFiltersMobile ? 'block' : 'hidden lg:block'">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3 w-full">
          <!-- Type -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700">Type</label>

            <button
              type="button"
              class="w-full mt-1 border border-gray-300 cursor-pointer rounded-lg px-3 py-2 flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="openTypes = !openTypes"
            >
              <span class="text-sm text-gray-900">{{ typesLabel }}</span>
              <span class="text-gray-500 text-xs">▾</span>
            </button>

            <!-- overlay za klik izvan -->
            <div v-if="openTypes" class="fixed inset-0 z-10" @click="openTypes = false"></div>

            <div
              v-if="openTypes"
              class="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20"
            >
              <div class="flex justify-between gap-2 mb-2">
                <button
                  type="button"
                  class="text-xs px-2 py-1 cursor-pointer rounded border border-gray-300 hover:bg-gray-50"
                  @click="selectAllTypes"
                >
                  Select all
                </button>
                <button
                  type="button"
                  class="text-xs px-2 py-1 cursor-pointer rounded border border-gray-300 hover:bg-gray-50"
                  @click="clearTypes"
                >
                  Clear
                </button>
              </div>

              <div class="max-h-48 overflow-auto space-y-1">
                <label
                  v-for="t in availableTypes"
                  :key="t"
                  class="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="modelValue.types?.includes(t)"
                    @change="toggleType(t)"
                  />
                  <span class="text-sm">{{ t }}</span>
                </label>
              </div>

              <div class="pt-2 flex justify-end">
                <button
                  type="button"
                  class="text-sm px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  @click="openTypes = false"
                >
                  OK
                </button>
              </div>
            </div>
          </div>

          <BaseInput
            label="Od datuma"
            type="date"
            :modelValue="modelValue.dateFrom"
            @update:modelValue="(v) => update({ dateFrom: v })"
          />
          <BaseInput
            label="Do datuma"
            type="date"
            :modelValue="modelValue.dateTo"
            @update:modelValue="(v) => update({ dateTo: v })"
          />

          <BaseInput
            label="Min min"
            type="number"
            :modelValue="modelValue.minDur"
            @update:modelValue="(v) => update({ minDur: v })"
          />
          <BaseInput
            label="Max min"
            type="number"
            :modelValue="modelValue.maxDur"
            @update:modelValue="(v) => update({ maxDur: v })"
          />
        </div>

        <!-- DESKTOP ONLY: sort+reset (na mobu je gore u headeru) -->
        <div class="hidden lg:flex gap-2 items-center">
          <select
            class="border rounded-full px-3 py-2 text-sm cursor-pointer"
            :value="modelValue.sort"
            @change="update({ sort: $event.target.value })"
          >
            <option value="newest">Najnoviji</option>
            <option value="oldest">Najstariji</option>
          </select>

          <BaseButton variant="secondary" @click="reset">Reset</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
