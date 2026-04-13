<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { formatDateTime } from "@/utils/date";
import { computeTriggerAt } from "@/utils/task";

const props = withDefaults(
  defineProps<{
    initialValues?: {
      title: string;
      notes: string;
      dueAt: string;
      remindBeforeMinutes: number;
    };
    submitLabel?: string;
  }>(),
  {
    initialValues: () => ({
      title: "",
      notes: "",
      dueAt: "",
      remindBeforeMinutes: 60,
    }),
    submitLabel: "Save Task",
  },
);

const emit = defineEmits<{
  submit: [
    {
      title: string;
      notes: string;
      dueAt: string;
      remindBeforeMinutes: number;
    },
  ];
}>();

const form = reactive({
  title: props.initialValues.title,
  notes: props.initialValues.notes,
  dueAt: props.initialValues.dueAt,
  remindBeforeMinutes: props.initialValues.remindBeforeMinutes,
});

const errorMessage = ref("");

watch(
  () => props.initialValues,
  (value) => {
    form.title = value.title;
    form.notes = value.notes;
    form.dueAt = value.dueAt;
    form.remindBeforeMinutes = value.remindBeforeMinutes;
  },
  { deep: true },
);

const triggerPreview = computed(() => {
  if (!form.dueAt) {
    return "Select a due time to preview triggerAt";
  }

  return formatDateTime(computeTriggerAt(form.dueAt, Number(form.remindBeforeMinutes)));
});

function handleSubmit() {
  const title = form.title.trim();
  const remindBeforeMinutes = Number(form.remindBeforeMinutes);

  if (!title) {
    errorMessage.value = "Title is required.";
    return;
  }

  if (!form.dueAt) {
    errorMessage.value = "Due time is required.";
    return;
  }

  if (!Number.isFinite(remindBeforeMinutes) || remindBeforeMinutes < 0) {
    errorMessage.value = "Remind before must be a non-negative number.";
    return;
  }

  errorMessage.value = "";

  emit("submit", {
    title,
    notes: form.notes.trim(),
    dueAt: form.dueAt,
    remindBeforeMinutes,
  });
}
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <label>
      <span>Title</span>
      <input v-model="form.title" type="text" maxlength="120" required />
    </label>

    <label>
      <span>Notes</span>
      <textarea v-model="form.notes" rows="4" />
    </label>

    <label>
      <span>Due time</span>
      <input v-model="form.dueAt" type="datetime-local" required />
    </label>

    <label>
      <span>Remind before (minutes)</span>
      <input v-model="form.remindBeforeMinutes" type="number" min="0" step="5" required />
    </label>

    <div class="trigger-preview">
      <strong>Trigger preview</strong>
      <p>{{ triggerPreview }}</p>
    </div>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <button class="primary-button" type="submit">{{ submitLabel }}</button>
  </form>
</template>
