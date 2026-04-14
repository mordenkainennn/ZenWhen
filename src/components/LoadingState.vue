<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "@/i18n";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
  }>(),
  {
    title: "",
    description: "",
  },
);

const { t } = useI18n();

const resolvedTitle = computed(() => props.title || t("loading.defaultTitle"));
const resolvedDescription = computed(() => props.description || t("loading.defaultDescription"));
</script>

<template>
  <div class="loading-state">
    <div class="loading-spinner" aria-hidden="true"></div>
    <div>
      <h3>{{ resolvedTitle }}</h3>
      <p>{{ resolvedDescription }}</p>
    </div>
  </div>
</template>
