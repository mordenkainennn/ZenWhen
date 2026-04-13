<script setup lang="ts">
import { computed } from "vue";
import type { Task } from "@/types/task";
import { formatDateTime, nowIso } from "@/utils/date";
import { getInboxStatus, getReminderStatus } from "@/utils/task";

const props = defineProps<{
  task: Task;
  statusContext?: "reminder" | "inbox";
}>();

const emit = defineEmits<{
  complete: [taskId: string];
  remove: [taskId: string];
}>();

const status = computed(() => {
  const now = nowIso();

  if (props.statusContext === "inbox") {
    return getInboxStatus(props.task, now);
  }

  return getReminderStatus(props.task, now);
});

function handleComplete() {
  emit("complete", props.task.id);
}

function handleRemove() {
  emit("remove", props.task.id);
}
</script>

<template>
  <article class="task-card">
    <div class="task-card-top">
      <span class="task-status" :class="`task-status-${status.tone}`">{{ status.label }}</span>
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

    <div class="task-actions">
      <button class="secondary-button" type="button" @click="handleComplete">Complete</button>
      <button class="danger-button" type="button" @click="handleRemove">Delete</button>
    </div>
  </article>
</template>
