<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { requestNotificationPermission } from "@/services/notification-service";
import { useTaskStore } from "@/stores/task";
import { todayKey } from "@/utils/date";

const route = useRoute();
const taskStore = useTaskStore();
const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);
const installState = ref<"available" | "installed" | "unsupported">("unsupported");

const navItems = [
  { to: "/", label: "Reminder", variant: "primary" as const },
  { to: "/inbox", label: "Inbox", variant: "secondary" as const },
  { to: "/review", label: "Review", variant: "primary" as const },
  { to: "/calendar", label: "Calendar", variant: "primary" as const },
];

function getNavCount(path: string) {
  if (path === "/") {
    return taskStore.reminderTasks.length;
  }

  if (path === "/inbox") {
    return taskStore.inboxTasks.length;
  }

  if (path === "/review") {
    return taskStore.reviewTasks.length;
  }

  if (path === "/calendar") {
    return taskStore.tasks.filter(
      (task) => !task.completed && !task.archived && task.dueAt.startsWith(todayKey()),
    ).length;
  }

  return 0;
}

async function enableNotifications() {
  const permission = await requestNotificationPermission();
  taskStore.setNotificationPermission(permission);

  if (permission === "granted") {
    await taskStore.syncTriggeredNotifications();
  }
}

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault();
  installPromptEvent.value = event as BeforeInstallPromptEvent;
  installState.value = "available";
}

function handleAppInstalled() {
  installPromptEvent.value = null;
  installState.value = "installed";
}

async function installApp() {
  if (!installPromptEvent.value) {
    return;
  }

  await installPromptEvent.value.prompt();
  const choice = await installPromptEvent.value.userChoice;

  if (choice.outcome === "accepted") {
    installState.value = "installed";
    installPromptEvent.value = null;
    return;
  }

  installState.value = "available";
}

onMounted(() => {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches;

  if (isStandalone) {
    installState.value = "installed";
  }

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<template>
  <div class="app-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">ZenWhen</p>
        <h1>Tasks should surface when it is time to act.</h1>
        <p class="hero-copy">
          A low-interruption reminder system that keeps future work hidden until the right moment.
        </p>
        <p class="hero-meta">
          Notifications:
          <strong>{{ taskStore.notificationPermission }}</strong>
        </p>
        <p class="hero-meta">
          Install:
          <strong>{{ installState }}</strong>
        </p>
      </div>

      <div class="hero-actions">
        <button
          v-if="taskStore.notificationPermission !== 'granted'"
          class="secondary-button"
          type="button"
          @click="enableNotifications"
        >
          Enable Notifications
        </button>
        <button
          v-if="installState === 'available'"
          class="secondary-button"
          type="button"
          @click="installApp"
        >
          Install App
        </button>
        <RouterLink class="new-task-link" to="/tasks/new">New Task</RouterLink>
      </div>
    </header>

    <nav class="main-nav" aria-label="Primary">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{
          active: route.path === item.to,
          'nav-link-secondary': item.variant === 'secondary',
        }"
      >
        <span>{{ item.label }}</span>
        <span class="nav-count">{{ getNavCount(item.to) }}</span>
      </RouterLink>
    </nav>

    <main class="content-panel">
      <RouterView />
    </main>
  </div>
</template>
