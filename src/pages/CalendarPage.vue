<script setup lang="ts">
import { onMounted } from "vue";
import PageHeader from "@/components/PageHeader.vue";
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
      title="Calendar"
      description="A simplified time-distribution view for spotting busy days."
    />

    <div class="empty-state">
      <h3>Calendar view is planned as a simplified month view</h3>
      <p>The route is wired, and the next step is rendering task distribution by date.</p>
    </div>
  </section>
</template>
