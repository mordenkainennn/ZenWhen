<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { formatLongDate, toDateKey } from "@/utils/date";

const taskStore = useTaskStore();
const actionMessage = ref("");
const processingTaskId = ref("");

onMounted(() => {
  if (!taskStore.initialized) {
    void taskStore.loadTasks();
  }
});

async function handleComplete(taskId: string) {
  processingTaskId.value = taskId;

  try {
    await taskStore.completeTask(taskId);
    actionMessage.value = "Task marked complete before it needed to surface.";
  } finally {
    processingTaskId.value = "";
  }
}

async function handleRemove(taskId: string) {
  if (!window.confirm("Delete this hidden future task?")) {
    return;
  }

  processingTaskId.value = taskId;

  try {
    await taskStore.removeTask(taskId);
    actionMessage.value = "Future task deleted.";
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
      title="Inbox"
      description="Future tasks live here until their trigger time surfaces them."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>

    <LoadingState
      v-if="taskStore.loading"
      title="Loading hidden tasks"
      description="Collecting future tasks that have not surfaced yet."
    />

    <div v-else-if="inboxGroups.length" class="review-groups">
      <section v-for="group in inboxGroups" :key="group.dateKey" class="review-group">
        <header class="review-group-header">
          <div>
            <p class="page-kicker">Trigger Date</p>
            <h3>{{ group.label }}</h3>
          </div>
          <p class="review-group-count">
            {{ group.tasks.length }} task<span v-if="group.tasks.length !== 1">s</span>
          </p>
        </header>

        <p class="section-description">These tasks stay hidden until this date reaches their trigger time.</p>

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
      <h3>Inbox is clear</h3>
      <p>You have no hidden future tasks at the moment.</p>
    </div>
  </section>
</template>
