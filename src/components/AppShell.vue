<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useI18n } from "@/i18n";
import { requestNotificationPermission } from "@/services/notification-service";
import { useTaskStore } from "@/stores/task";
import { todayKey } from "@/utils/date";

const route = useRoute();
const taskStore = useTaskStore();
const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);
const installState = ref<"available" | "installed" | "unsupported">("unsupported");
const { locale, setLocale, t } = useI18n();

const navItems = [
  { to: "/", labelKey: "nav.reminder", variant: "primary" as const },
  { to: "/inbox", labelKey: "nav.inbox", variant: "secondary" as const },
  { to: "/review", labelKey: "nav.review", variant: "primary" as const },
  { to: "/calendar", labelKey: "nav.calendar", variant: "primary" as const },
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
        <p class="eyebrow">{{ t("app.name") }}</p>
        <h1>{{ t("app.tagline") }}</h1>
        <p class="hero-copy">{{ t("app.description") }}</p>
        <p class="hero-meta">
          {{ t("app.notifications") }}:
          <strong>{{ t(`notification.${taskStore.notificationPermission}`) }}</strong>
        </p>
        <p class="hero-meta">
          {{ t("app.install") }}:
          <strong>{{ t(`install.${installState}`) }}</strong>
        </p>
      </div>

      <div class="hero-actions">
        <div class="language-switch" role="group" :aria-label="t('app.languageSwitch')">
          <button
            class="secondary-button language-button"
            :class="{ 'language-button-active': locale === 'zh-CN' }"
            type="button"
            @click="setLocale('zh-CN')"
          >
            {{ t("app.lang.zh") }}
          </button>
          <button
            class="secondary-button language-button"
            :class="{ 'language-button-active': locale === 'en' }"
            type="button"
            @click="setLocale('en')"
          >
            {{ t("app.lang.en") }}
          </button>
        </div>
        <button
          v-if="taskStore.notificationPermission !== 'granted'"
          class="secondary-button"
          type="button"
          @click="enableNotifications"
        >
          {{ t("app.enableNotifications") }}
        </button>
        <button
          v-if="installState === 'available'"
          class="secondary-button"
          type="button"
          @click="installApp"
        >
          {{ t("app.installApp") }}
        </button>
        <RouterLink class="new-task-link" to="/tasks/new">{{ t("app.newTask") }}</RouterLink>
      </div>
    </header>

    <nav class="main-nav" :aria-label="t('nav.primaryAria')">
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
        <span>{{ t(item.labelKey) }}</span>
        <span class="nav-count">{{ getNavCount(item.to) }}</span>
      </RouterLink>
    </nav>

    <main class="content-panel">
      <RouterView />
    </main>
  </div>
</template>
