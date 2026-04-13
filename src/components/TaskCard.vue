<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/types/task";
import { formatDateTime, nowIso } from "@/utils/date";
import { isOverdueTask } from "@/utils/task";

const props = defineProps<{
  task: Task;
}>();

const statusLabel = computed(() => {
  if (isOverdueTask(props.task, nowIso())) {
    return "Overdue";
  }

  return "Scheduled";
});
</script>

<template>
  <article class="task-card">
    <div class="task-card-top">
      <span class="task-status">{{ statusLabel }}</span>
      <RouterLink class="task-edit-link" :to="`/tasks/${task.id}/edit`">Edit</RouterLink>
    </div>

    <h3>{{ task.title }}</h3>
    <p v-if="task.notes" class="task-notes">{{ task.notes }}</p>

    <dl class="task-meta">
      <div>
        <dt>Due</dt>
        <dd>{{ formatDateTime(task.dueAt) }}</dd>
      </div>
      <div>
        <dt>Trigger</dt>
        <dd>{{ formatDateTime(task.triggerAt) }}</dd>
      </div>
      <div>
        <dt>Lead time</dt>
        <dd>{{ task.remindBeforeMinutes }} minutes</dd>
      </div>
    </dl>
  </article>
</template>
