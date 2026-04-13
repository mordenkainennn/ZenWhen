<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "Loading tasks",
    description: "Preparing your current task view.",
  },
);
</script>

<template>
  <div class="loading-state">
    <div class="loading-spinner" aria-hidden="true"></div>
    <div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </div>
</template>
