<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "@/i18n";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { formatLongDate, toDateKey } from "@/utils/date";

const taskStore = useTaskStore();
const actionMessage = ref("");
const processingTaskId = ref("");
const { t } = useI18n();

onMounted(() => {
  if (!taskStore.initialized) {
    void taskStore.loadTasks();
  }
});

async function handleComplete(taskId: string) {
  processingTaskId.value = taskId;

  try {
    await taskStore.completeTask(taskId);
    actionMessage.value = t("inbox.completeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

async function handleRemove(taskId: string) {
  if (!window.confirm(t("confirm.deleteInboxTask"))) {
    return;
  }

  processingTaskId.value = taskId;

  try {
    await taskStore.removeTask(taskId);
    actionMessage.value = t("inbox.removeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

const inboxGroups = computed(() => {
  const groups = new Map<
    string,
    {
      dateKey: string;
      label: string;
      tasks: Task[];
    }
  >();

  for (const task of taskStore.inboxTasks) {
    const dateKey = toDateKey(task.triggerAt);
    const existing = groups.get(dateKey);

    if (existing) {
      existing.tasks.push(task);
      continue;
    }

    groups.set(dateKey, {
      dateKey,
      label: formatLongDate(dateKey),
      tasks: [task],
    });
  }

  return [...groups.values()];
});
</script>

<template>
  <section class="page-stack">
    <PageHeader
      :title="t('inbox.title')"
      :description="t('inbox.description')"
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <LoadingState
      v-if="taskStore.loading"
      :title="t('loading.inboxTitle')"
      :description="t('loading.inboxDescription')"
    />

    <div v-else-if="inboxGroups.length" class="review-groups">
      <section v-for="group in inboxGroups" :key="group.dateKey" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">{{ t("page.triggerDate") }}</p>
            <h3>{{ group.label }}</h3>
          </div>
          <p class="review-group-count">{{ t("task.count", { count: group.tasks.length }) }}</p>
        </header>

        <p class="section-description">{{ t("inbox.sectionDescription") }}</p>

        <div class="task-list">
          <TaskCard
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            :busy="processingTaskId === task.id"
            status-context="inbox"
            @complete="handleComplete"
            @remove="handleRemove"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <h3>{{ t("inbox.emptyTitle") }}</h3>
      <p>{{ t("inbox.emptyDescription") }}</p>
    </div>
  </section>
</template>
