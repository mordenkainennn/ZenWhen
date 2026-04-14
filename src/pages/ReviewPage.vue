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
    actionMessage.value = t("review.completeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

async function handleRemove(taskId: string) {
  if (!window.confirm(t("confirm.deleteReviewTask"))) {
    return;
  }

  processingTaskId.value = taskId;

  try {
    await taskStore.removeTask(taskId);
    actionMessage.value = t("review.removeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

const reviewGroups = computed(() => {
  const groups = new Map<
    string,
    {
      dateKey: string;
      label: string;
      tasks: Task[];
    }
  >();

  for (const task of taskStore.reviewTasks) {
    const dateKey = toDateKey(task.dueAt);
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
      :title="t('review.title')"
      :description="t('review.description')"
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <LoadingState
      v-if="taskStore.loading"
      :title="t('loading.reviewTitle')"
      :description="t('loading.reviewDescription')"
    />

    <div v-else-if="reviewGroups.length" class="review-groups">
      <section v-for="group in reviewGroups" :key="group.dateKey" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">{{ t("page.upcomingDate") }}</p>
            <h3>{{ group.label }}</h3>
          </div>
          <p class="review-group-count">{{ t("task.count", { count: group.tasks.length }) }}</p>
        </header>

        <div class="task-list">
          <TaskCard
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            :busy="processingTaskId === task.id"
            @complete="handleComplete"
            @remove="handleRemove"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <h3>{{ t("review.emptyTitle") }}</h3>
      <p>{{ t("review.emptyDescription") }}</p>
    </div>
  </section>
</template>
