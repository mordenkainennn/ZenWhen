<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  { to: "/", label: "Reminder" },
  { to: "/inbox", label: "Inbox" },
  { to: "/review", label: "Review" },
  { to: "/calendar", label: "Calendar" },
];
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
      </div>

      <RouterLink class="new-task-link" to="/tasks/new">New Task</RouterLink>
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
