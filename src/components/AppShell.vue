<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useI18n } from "@/i18n";
import { useTaskStore } from "@/stores/task";
import { todayKey } from "@/utils/date";

const route = useRoute();
const taskStore = useTaskStore();
const installPromptEvent = ref<BeforeInstallPromptEvent | null>(null);
const installState = ref<"available" | "installed" | "unsupported">("unsupported");
const isSettingsOpen = ref(false);
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

    <section class="status-section" :aria-label="t('app.statusTitle')">
      <p class="page-kicker">{{ t("app.statusTitle") }}</p>
      <div class="status-strip">
        <span class="status-pill">
          <span class="status-label">{{ t("app.notifications") }}</span>
          <strong>{{ t(`notification.${taskStore.notificationPermission}`) }}</strong>
        </span>
        <span class="status-pill">
          <span class="status-label">{{ t("app.install") }}</span>
          <strong>{{ t(`install.${installState}`) }}</strong>
        </span>
      </div>
    </section>

    <section class="language-section">
      <p class="page-kicker">{{ t("app.languageSection") }}</p>
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
          <p>{{ t("settings.notificationsPlaceholder") }}</p>
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.install") }}</h3>
          <p>{{ t("settings.installPlaceholder") }}</p>
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.language") }}</h3>
          <p>{{ t("settings.languagePlaceholder") }}</p>
        </section>

        <section class="settings-group">
          <h3>{{ t("settings.version") }}</h3>
          <p>{{ t("settings.versionPlaceholder") }}</p>
        </section>
      </section>
    </div>
  </div>
</template>
