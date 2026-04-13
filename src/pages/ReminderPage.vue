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
  actionMessage.value = "Task completed and removed from your active reminder queue.";
}

async function handleRemove(taskId: string) {
  await taskStore.removeTask(taskId);
  actionMessage.value = "Task deleted from local storage.";
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Reminder"
      description="Only tasks that should be actionable now belong here, sorted by urgency."
    />
    <div v-if="actionMessage" class="page-notice">{{ actionMessage }}</div>
    <TaskList
      :tasks="taskStore.reminderTasks"
      empty-title="Nothing needs your attention right now"
      empty-description="Future tasks stay hidden until their trigger time arrives."
      @complete="handleComplete"
      @remove="handleRemove"
    />
  </section>
</template>
