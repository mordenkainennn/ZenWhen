<script setup lang="ts">
import type { Task } from "@/types/task";
import TaskCard from "@/components/TaskCard.vue";

defineProps<{
  tasks: Task[];
  emptyTitle: string;
  emptyDescription: string;
}>();

const emit = defineEmits<{
  complete: [taskId: string];
  remove: [taskId: string];
}>();
</script>

<template>
  <div v-if="tasks.length" class="task-list">
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @complete="emit('complete', $event)"
      @remove="emit('remove', $event)"
    />
  </div>
  <div v-else class="empty-state">
    <h3>{{ emptyTitle }}</h3>
    <p>{{ emptyDescription }}</p>
  </div>
</template>
