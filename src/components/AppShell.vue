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
const isSettingsOpen = ref(false);
const APP_VERSION = "0.1.0";
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

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault();
  installPromptEvent.value = event as BeforeInstallPromptEvent;
  installState.value = "available";
}

function handleAppInstalled() {
  installPromptEvent.value = null;
  installState.value = "installed";
}

async function enableNotifications() {
  const permission = await requestNotificationPermission();
  taskStore.setNotificationPermission(permission);

  if (permission === "granted") {
    await taskStore.syncTriggeredNotifications();
  }
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

function openSettings() {
  isSettingsOpen.value = true;
}

function closeSettings() {
  isSettingsOpen.value = false;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isSettingsOpen.value) {
    closeSettings();
  }
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
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="app-shell">
    <header class="hero">
      <div class="hero-topbar">
        <div class="hero-topbar-spacer"></div>
        <button class="settings-button" type="button" @click="openSettings">
          {{ t("app.settings") }}
        </button>
      </div>

      <div class="hero-copy-block">
        <p class="eyebrow">{{ t("app.name") }}</p>
        <h1 class="hero-title">{{ t("app.heroTitle") }}</h1>
        <p class="hero-copy">{{ t("app.heroSubtitle") }}</p>
      </div>

    </header>

    <main class="content-panel">
      <RouterView />
    </main>

    <section class="nav-section">
      <div class="nav-section-header">
        <p class="page-kicker">{{ t("nav.title") }}</p>
        <p class="nav-section-description">{{ t("nav.description") }}</p>
      </div>

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
    </section>

    <div
      v-if="isSettingsOpen"
      class="settings-overlay"
      @click.self="closeSettings"
    >
      <section
        class="settings-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'settings-title'"
      >
        <header class="settings-panel-header">
          <div>
            <p class="page-kicker">{{ t("app.settings") }}</p>
            <h2 id="settings-title">{{ t("settings.title") }}</h2>
          </div>
          <button class="secondary-button settings-close-button" type="button" @click="closeSettings">
            {{ t("settings.close") }}
          </button>
        </header>

        <section class="settings-group">
          <h3>{{ t("settings.notifications") }}</h3>
          <p class="settings-status-line">
            <span class="settings-label">{{ t("settings.currentStatus") }}</span>
            <strong>{{ t(`notification.${taskStore.notificationPermission}`) }}</strong>
          </p>
          <p>{{ t("settings.notificationsDescription") }}</p>
          <button
            v-if="taskStore.notificationPermission !== 'granted'"
            class="secondary-button settings-action-button"
            type="button"
            @click="enableNotifications"
          >
            {{ t("app.enableNotifications") }}
          </button>
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.install") }}</h3>
          <p class="settings-status-line">
            <span class="settings-label">{{ t("settings.currentStatus") }}</span>
            <strong>{{ t(`install.${installState}`) }}</strong>
          </p>
          <p>{{ t("settings.installDescription") }}</p>
          <button
            v-if="installState === 'available'"
            class="secondary-button settings-action-button"
            type="button"
            @click="installApp"
          >
            {{ t("app.installApp") }}
          </button>
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.language") }}</h3>
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
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.version") }}</h3>
          <p class="settings-version">v{{ APP_VERSION }}</p>
        </section>
      </section>
    </div>
  </div>
</template>
