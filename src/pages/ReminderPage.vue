<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { getReminderStatus } from "@/utils/task";
import { nowIso } from "@/utils/date";

const taskStore = useTaskStore();
const actionMessage = ref("");

onMounted(() => {
  if (!taskStore.tasks.length) {
    void taskStore.loadTasks();
  }
});

async function handleComplete(taskId: string) {
  await taskStore.completeTask(taskId);
  actionMessage.value = "Task completed and removed from your active reminder queue.";
}

async function handleRemove(taskId: string) {
  await taskStore.removeTask(taskId);
  actionMessage.value = "Task deleted from local storage.";
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
      title: "Overdue",
      description: "Tasks that already passed their due time and need attention first.",
      tasks: sections.overdue,
    },
    {
      key: "today",
      title: "Today",
      description: "Tasks due later today that are already within their reminder window.",
      tasks: sections.today,
    },
    {
      key: "upcoming",
      title: "Upcoming",
      description: "Triggered tasks that are visible now but still due on a later date.",
      tasks: sections.upcoming,
    },
  ].filter((section) => section.tasks.length);
});
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Reminder"
      description="Only tasks that should be actionable now belong here, sorted by urgency."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <LoadingState
      v-if="taskStore.loading"
      title="Loading reminder queue"
      description="Sorting triggered tasks by urgency."
    />

    <div v-else-if="reminderSections.length" class="review-groups">
      <section v-for="section in reminderSections" :key="section.key" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">Reminder Section</p>
            <h3>{{ section.title }}</h3>
          </div>
          <p class="review-group-count">
            {{ section.tasks.length }} task<span v-if="section.tasks.length !== 1">s</span>
          </p>
        </header>

        <p class="section-description">{{ section.description }}</p>

        <div class="task-list">
          <TaskCard
            v-for="task in section.tasks"
            :key="task.id"
            :task="task"
            @complete="handleComplete"
            @remove="handleRemove"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <h3>Nothing needs your attention right now</h3>
      <p>Future tasks stay hidden until their trigger time arrives.</p>
    </div>
  </section>
</template>
