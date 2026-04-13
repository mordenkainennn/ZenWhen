<script setup lang="ts">
import { computed, reactive, watch } from "vue";
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

  return computeTriggerAt(form.dueAt, form.remindBeforeMinutes);
});

function handleSubmit() {
  emit("submit", {
    title: form.title.trim(),
    notes: form.notes.trim(),
    dueAt: form.dueAt,
    remindBeforeMinutes: Number(form.remindBeforeMinutes),
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

    <button class="primary-button" type="submit">{{ submitLabel }}</button>
  </form>
</template>
