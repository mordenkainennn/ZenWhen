<script setup lang="ts">
import { useI18n } from "@/i18n";

defineProps<{
  title: string;
  description: string;
}>();

const { t } = useI18n();
</script>

<template>
  <header class="page-header">
    <div>
      <p class="page-kicker">{{ t("page.currentView") }}</p>
      <h2>{{ title }}</h2>
    </div>
    <p class="page-description">{{ description }}</p>
  </header>
</template>
