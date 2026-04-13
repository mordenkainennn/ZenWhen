<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { formatLongDate, toDateKey } from "@/utils/date";

const taskStore = useTaskStore();
const actionMessage = ref("");

onMounted(() => {
  if (!taskStore.tasks.length) {
    void taskStore.loadTasks();
  }
});

async function handleComplete(taskId: string) {
  await taskStore.completeTask(taskId);
  actionMessage.value = "Task completed from the review window.";
}

async function handleRemove(taskId: string) {
  await taskStore.removeTask(taskId);
  actionMessage.value = "Task removed from the review window.";
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
      title="Review"
      description="A safety layer for checking what is coming in the next 15 days."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <div v-if="reviewGroups.length" class="review-groups">
      <section v-for="group in reviewGroups" :key="group.dateKey" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">Upcoming Date</p>
            <h3>{{ group.label }}</h3>
          </div>
          <p class="review-group-count">
            {{ group.tasks.length }} task<span v-if="group.tasks.length !== 1">s</span>
          </p>
        </header>

        <div class="task-list">
          <TaskCard
            v-for="task in group.tasks"
            :key="task.id"
            :task="task"
            @complete="handleComplete"
            @remove="handleRemove"
          />
        </div>
      </section>
    </div>

    <div v-else class="empty-state">
      <h3>No upcoming tasks in the review window</h3>
      <p>Review helps catch future commitments before they surprise you.</p>
    </div>
  </section>
</template>
