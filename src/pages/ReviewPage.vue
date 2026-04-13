<script setup lang="ts">
import { onMounted, ref } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskList from "@/components/TaskList.vue";
import { useTaskStore } from "@/stores/task";

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
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Review"
      description="A safety layer for checking what is coming in the next 15 days."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>
    <TaskList
      :tasks="taskStore.reviewTasks"
      empty-title="No upcoming tasks in the review window"
      empty-description="Review helps catch future commitments before they surprise you."
      @complete="handleComplete"
      @remove="handleRemove"
    />
  </section>
</template>
