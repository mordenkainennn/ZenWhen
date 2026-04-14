<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "@/i18n";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { getReminderStatus } from "@/utils/task";
import { nowIso } from "@/utils/date";

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
    actionMessage.value = t("reminder.completeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

async function handleRemove(taskId: string) {
  if (!window.confirm(t("confirm.deleteTask"))) {
    return;
  }

  processingTaskId.value = taskId;

  try {
    await taskStore.removeTask(taskId);
    actionMessage.value = t("reminder.removeNotice");
  } finally {
    processingTaskId.value = "";
  }
}

const reminderSections = computed(() => {
  const now = nowIso();
  const sections = {
    overdue: [] as Task[],
    today: [] as Task[],
    upcoming: [] as Task[],
  };

  for (const task of taskStore.reminderTasks) {
    const status = getReminderStatus(task, now);

    if (status.tone === "overdue") {
      sections.overdue.push(task);
      continue;
    }

    if (status.tone === "today") {
      sections.today.push(task);
      continue;
    }

    sections.upcoming.push(task);
  }

  return [
    {
      key: "overdue",
      title: t("reminder.section.overdue"),
      description: t("reminder.section.overdueDesc"),
      tasks: sections.overdue,
    },
    {
      key: "today",
      title: t("reminder.section.today"),
      description: t("reminder.section.todayDesc"),
      tasks: sections.today,
    },
    {
      key: "upcoming",
      title: t("reminder.section.upcoming"),
      description: t("reminder.section.upcomingDesc"),
      tasks: sections.upcoming,
    },
  ].filter((section) => section.tasks.length);
});
</script>

<template>
  <section class="page-stack">
    <PageHeader
      :title="t('reminder.title')"
      :description="t('reminder.description')"
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <LoadingState
      v-if="taskStore.loading"
      :title="t('loading.reminderTitle')"
      :description="t('loading.reminderDescription')"
    />

    <div v-else-if="reminderSections.length" class="review-groups">
      <section v-for="section in reminderSections" :key="section.key" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">{{ t("page.reminderSection") }}</p>
            <h3>{{ section.title }}</h3>
          </div>
          <p class="review-group-count">{{ t("task.count", { count: section.tasks.length }) }}</p>
        </header>

        <p class="section-description">{{ section.description }}</p>

        <div class="task-list">
          <TaskCard
            v-for="task in section.tasks"
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
      <h3>{{ t("reminder.emptyTitle") }}</h3>
      <p>{{ t("reminder.emptyDescription") }}</p>
    </div>
  </section>
</template>
