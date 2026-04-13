<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import AppShell from "@/components/AppShell.vue";
import { getNotificationPermission } from "@/services/notification-service";
import { useTaskStore } from "@/stores/task";

const taskStore = useTaskStore();

async function syncNotificationPermission() {
  taskStore.setNotificationPermission(await getNotificationPermission());
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    void taskStore.loadTasksAndSyncNotifications();
  }
}

onMounted(async () => {
  await syncNotificationPermission();
  await taskStore.loadTasksAndSyncNotifications();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <AppShell />
</template>
