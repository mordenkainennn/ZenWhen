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
      remindBeforeMinutes: number;
    };
    submitLabel?: string;
    submitting?: boolean;
  }>(),
  {
    initialValues: () => ({
      title: "",
      notes: "",
      dueAt: "",
      remindBeforeMinutes: 60,
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
const { t } = useI18n();

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
    return t("form.selectDueTime");
  }

  return formatDateTime(computeTriggerAt(form.dueAt, Number(form.remindBeforeMinutes)));
});

function handleSubmit() {
  const title = form.title.trim();
  const remindBeforeMinutes = Number(form.remindBeforeMinutes);

  errorMessage.value = validateTaskInput({
    title,
    dueAt: form.dueAt,
    remindBeforeMinutes,
  });

  if (errorMessage.value) {
    return;
  }

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
      <span>{{ t("form.title") }}</span>
      <input v-model="form.title" type="text" maxlength="120" required :disabled="submitting" />
    </label>

    <label>
      <span>{{ t("form.notes") }}</span>
      <textarea v-model="form.notes" rows="4" :disabled="submitting" />
    </label>

    <label>
      <span>{{ t("form.dueTime") }}</span>
      <input v-model="form.dueAt" type="datetime-local" required :disabled="submitting" />
    </label>

    <label>
      <span>{{ t("form.remindBefore") }}</span>
      <input
        v-model="form.remindBeforeMinutes"
        type="number"
        min="0"
        step="5"
        required
        :disabled="submitting"
      />
    </label>

    <div class="preset-group">
      <span class="preset-label">{{ t("form.quickPresets") }}</span>
      <div class="preset-list">
        <button
          v-for="preset in REMINDER_PRESETS"
          :key="preset.label"
          class="preset-button"
          :class="{ 'preset-button-active': Number(form.remindBeforeMinutes) === preset.minutes }"
          type="button"
          :disabled="submitting"
          @click="form.remindBeforeMinutes = preset.minutes"
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

    <button class="primary-button" type="submit" :disabled="submitting">
      {{ submitting ? t("editor.saving") : submitLabel || t("editor.editSubmit") }}
    </button>
  </form>
</template>
