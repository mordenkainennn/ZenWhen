<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { requestNotificationPermission } from "@/services/notification-service";
import { useTaskStore } from "@/stores/task";

const route = useRoute();
const taskStore = useTaskStore();
const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);
const installState = ref<"available" | "installed" | "unsupported">("unsupported");

const navItems = [
  { to: "/", label: "Reminder" },
  { to: "/inbox", label: "Inbox" },
  { to: "/review", label: "Review" },
  { to: "/calendar", label: "Calendar" },
];

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
        :class="{ active: route.path === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="content-panel">
      <RouterView />
    </main>
  </div>
</template>
