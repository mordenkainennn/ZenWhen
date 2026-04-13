<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import AppShell from "@/components/AppShell.vue";
import { getNotificationPermission, scanAndNotifyTasks } from "@/services/notification-service";
import { useTaskStore } from "@/stores/task";

const taskStore = useTaskStore();

async function syncNotificationPermission() {
  taskStore.setNotificationPermission(await getNotificationPermission());
}

async function scanNotifications() {
  await taskStore.loadTasks();
  await scanAndNotifyTasks(taskStore.tasks);
  await taskStore.loadTasks();
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    void scanNotifications();
  }
}

onMounted(async () => {
  await syncNotificationPermission();
  await scanNotifications();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <AppShell />
</template>
