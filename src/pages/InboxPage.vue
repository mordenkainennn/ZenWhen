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
  actionMessage.value = "Task marked complete before it needed to surface.";
}

async function handleRemove(taskId: string) {
  await taskStore.removeTask(taskId);
  actionMessage.value = "Future task deleted.";
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Inbox"
      description="Future tasks live here until their trigger time surfaces them."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>
    <TaskList
      :tasks="taskStore.inboxTasks"
      empty-title="Inbox is clear"
      empty-description="You have no hidden future tasks at the moment."
      @complete="handleComplete"
      @remove="handleRemove"
    />
  </section>
</template>
