<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "@/i18n";
import type { Task } from "@/types/task";
import { formatDateTime, nowIso } from "@/utils/date";
import { getInboxStatus, getReminderStatus } from "@/utils/task";

const props = defineProps<{
  task: Task;
  statusContext?: "reminder" | "inbox";
  busy?: boolean;
}>();

const emit = defineEmits<{
  complete: [taskId: string];
  remove: [taskId: string];
}>();

const { t } = useI18n();

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
      <span class="task-status" :class="`task-status-${status.tone}`">{{ t(`status.${status.key}`) }}</span>
      <RouterLink class="task-edit-link" :to="`/tasks/${task.id}/edit`">{{ t("task.edit") }}</RouterLink>
    </div>

    <h3>{{ task.title }}</h3>
    <p v-if="task.notes" class="task-notes">{{ task.notes }}</p>

    <dl class="task-meta">
      <div>
        <dt>{{ t("task.due") }}</dt>
        <dd>{{ formatDateTime(task.dueAt) }}</dd>
      </div>
      <div>
        <dt>{{ t("task.trigger") }}</dt>
        <dd>{{ formatDateTime(task.triggerAt) }}</dd>
      </div>
      <div>
        <dt>{{ t("task.leadTime") }}</dt>
        <dd>{{ t("task.days", { count: task.remindBeforeDays }) }}</dd>
      </div>
    </dl>

    <div class="task-actions">
      <button class="secondary-button" type="button" :disabled="busy" @click="handleComplete">
        {{ busy ? t("task.working") : t("task.complete") }}
      </button>
      <button class="danger-button" type="button" :disabled="busy" @click="handleRemove">
        {{ busy ? t("task.working") : t("task.delete") }}
      </button>
    </div>
  </article>
</template>
