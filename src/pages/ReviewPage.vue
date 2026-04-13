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
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Review"
      description="A safety layer for checking what is coming in the next 15 days."
    />
    <TaskList
      :tasks="taskStore.reviewTasks"
      empty-title="No upcoming tasks in the review window"
      empty-description="Review helps catch future commitments before they surprise you."
    />
  </section>
</template>
