<script setup>
import WorkoutCard from './WorkoutCard.vue'

defineProps({
  workouts: {
    type: Array,
    default: () => [],
  },
  loading: Boolean,
  error: String,
  highlightId: String,
})

const emit = defineEmits(['delete', 'update'])
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold">Moji workouti</h3>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-3 relative">
      <div v-if="loading" key="loading" class="text-gray-600">Učitavanje...</div>

      <div v-else-if="error" key="error" class="text-red-600 font-bold text-sm">
        {{ error }}
      </div>

      <div v-else-if="!workouts.length" key="empty" class="text-gray-600">
        Nema workouta još. Dodaj prvi. 💪
      </div>

      <div v-else v-for="w in workouts" :key="w.id" class="list-item">
        <WorkoutCard
          :workout="w"
          :highlighted="String(w.id) === String(highlightId)"
          @delete="emit('delete', $event)"
          @update="emit('update', $event)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.list-enter-active {
  transition:
    opacity 420ms ease,
    transform 420ms cubic-bezier(0.2, 1.1, 0.2, 1),
    filter 420ms ease;
}
.list-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease,
    filter 260ms ease;
  position: absolute;
  width: 100%;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-26px) scale(0.94);
  filter: blur(3px);
}
.list-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.92);
  filter: blur(2px);
}
.list-move {
  transition: transform 320ms cubic-bezier(0.2, 1.1, 0.2, 1);
}
</style>
