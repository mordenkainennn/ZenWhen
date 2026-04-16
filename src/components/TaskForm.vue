<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "@/i18n";
import { formatDateTime } from "@/utils/date";
import { computeTriggerAt } from "@/utils/task";
import { REMINDER_PRESETS, validateTaskInput } from "@/utils/validation";

const props = withDefaults(
  defineProps<{
    initialValues?: {
      title: string;
      notes: string;
      dueAt: string;
      remindBeforeDays: number;
    };
    submitLabel?: string;
    submitting?: boolean;
  }>(),
  {
    initialValues: () => ({
      title: "",
      notes: "",
      dueAt: "",
      remindBeforeDays: 7,
    }),
    submitLabel: "",
    submitting: false,
  },
);

const emit = defineEmits<{
  submit: [
    {
      title: string;
      notes: string;
      dueAt: string;
      remindBeforeDays: number;
    },
  ];
}>();

const form = reactive({
  title: props.initialValues.title,
  notes: props.initialValues.notes,
  dueAt: props.initialValues.dueAt,
  remindBeforeDays: props.initialValues.remindBeforeDays,
});

const errorMessage = ref("");
const localSubmitting = ref(false);
const { t } = useI18n();

watch(
  () => props.initialValues,
  (value) => {
    form.title = value.title;
    form.notes = value.notes;
    form.dueAt = value.dueAt;
    form.remindBeforeDays = value.remindBeforeDays;
  },
  { deep: true },
);

const triggerPreview = computed(() => {
  if (!form.dueAt) {
    return t("form.selectDueTime");
  }

  return formatDateTime(computeTriggerAt(form.dueAt, Number(form.remindBeforeDays)));
});

function handleSubmit() {
  if (props.submitting || localSubmitting.value) {
    return;
  }

  const title = form.title.trim();
  const remindBeforeDays = Number(form.remindBeforeDays);

  errorMessage.value = validateTaskInput({
    title,
    dueAt: form.dueAt,
    remindBeforeDays,
  });

  if (errorMessage.value) {
    return;
  }

  localSubmitting.value = true;

  emit("submit", {
    title,
    notes: form.notes.trim(),
    dueAt: form.dueAt,
    remindBeforeDays,
  });
}

watch(
  () => props.submitting,
  (value) => {
    if (!value) {
      localSubmitting.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <label>
      <span>{{ t("form.title") }}</span>
      <input v-model="form.title" type="text" maxlength="120" required :disabled="submitting || localSubmitting" />
    </label>

    <label>
      <span>{{ t("form.notes") }}</span>
      <textarea v-model="form.notes" rows="4" :disabled="submitting || localSubmitting" />
    </label>

    <label>
      <span>{{ t("form.dueTime") }}</span>
      <input v-model="form.dueAt" type="datetime-local" required :disabled="submitting || localSubmitting" />
    </label>

    <label>
      <span>{{ t("form.remindBefore") }}</span>
      <input
        v-model="form.remindBeforeDays"
        type="number"
        min="0"
        step="1"
        required
        :disabled="submitting || localSubmitting"
      />
    </label>

    <div class="preset-group">
      <span class="preset-label">{{ t("form.quickPresets") }}</span>
      <div class="preset-list">
        <button
          v-for="preset in REMINDER_PRESETS"
          :key="preset.label"
          class="preset-button"
          :class="{ 'preset-button-active': Number(form.remindBeforeDays) === preset.days }"
          type="button"
          :disabled="submitting || localSubmitting"
          @click="form.remindBeforeDays = preset.days"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>

    <div class="trigger-preview">
      <strong>{{ t("form.triggerPreview") }}</strong>
      <p>{{ triggerPreview }}</p>
    </div>

    <p v-if="errorMessage" class="form-error">{{ t(errorMessage) }}</p>

    <button class="primary-button" type="submit" :disabled="submitting || localSubmitting">
      {{ submitting || localSubmitting ? t("editor.saving") : submitLabel || t("editor.editSubmit") }}
    </button>
  </form>
</template>
