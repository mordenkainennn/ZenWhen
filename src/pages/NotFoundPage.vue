<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "@/i18n";
import PageHeader from "@/components/PageHeader.vue";

const { t } = useI18n();
</script>

<template>
  <section class="page-stack">
    <PageHeader
      :title="t('notFound.title')"
      :description="t('notFound.description')"
    />

    <div class="empty-state not-found-state">
      <h3>{{ t("notFound.title") }}</h3>
      <p>{{ t("notFound.body") }}</p>
      <RouterLink class="primary-button" to="/">{{ t("notFound.back") }}</RouterLink>
    </div>
  </section>
</template>
