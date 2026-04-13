<script setup lang="ts">
import { RouterLink } from "vue-router";
import PageHeader from "@/components/PageHeader.vue";
</script>

<template>
  <section class="page-stack">
    <PageHeader
      title="Page Not Found"
      description="This route does not map to a ZenWhen view."
    />

    <div class="empty-state not-found-state">
      <h3>The page you requested could not be found</h3>
      <p>
        The address may be outdated, incomplete, or never existed in this app. You can head back
        to the reminder queue and continue from there.
      </p>
      <RouterLink class="primary-button" to="/">Back to Reminder</RouterLink>
    </div>
  </section>
</template>
