<script setup lang="ts">
import { onMounted } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskList from "@/components/TaskList.vue";
import { useTaskStore } from "@/stores/task";

const taskStore = useTaskStore();

onMounted(() => {
  if (!taskStore.tasks.length) {
    void taskStore.loadTasks();
  }
});

async function handleComplete(taskId: string) {
  await taskStore.completeTask(taskId);
}

async function handleRemove(taskId: string) {
  await taskStore.removeTask(taskId);
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Inbox"
      description="Future tasks live here until their trigger time surfaces them."
    />
    <TaskList
      :tasks="taskStore.inboxTasks"
      empty-title="Inbox is clear"
      empty-description="You have no hidden future tasks at the moment."
      @complete="handleComplete"
      @remove="handleRemove"
    />
  </section>
</template>
