<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "@/i18n";
import LoadingState from "@/components/LoadingState.vue";
import PageHeader from "@/components/PageHeader.vue";
import TaskForm from "@/components/TaskForm.vue";
import { useTaskStore } from "@/stores/task";
import type { Task } from "@/types/task";
import { formatLocalInputDateTime, nowIso } from "@/utils/date";
import { computeTriggerAt } from "@/utils/task";

const props = defineProps<{
  id?: string;
}>();

const router = useRouter();
const taskStore = useTaskStore();
const existingTask = ref<Task | null>(null);
const missingTask = ref(false);
const editorLoading = ref(false);
const submitting = ref(false);
const { t } = useI18n();

const initialValues = computed(() => ({
  title: existingTask.value?.title ?? "",
  notes: existingTask.value?.notes ?? "",
  dueAt: existingTask.value ? formatLocalInputDateTime(existingTask.value.dueAt) : "",
  remindBeforeDays: existingTask.value?.remindBeforeDays ?? 7,
}));

const isEditMode = computed(() => Boolean(props.id));

onMounted(async () => {
  editorLoading.value = true;

  try {
    if (!taskStore.initialized) {
      await taskStore.loadTasks();
    }

    if (props.id) {
      existingTask.value = await taskStore.findTask(props.id);
      missingTask.value = !existingTask.value;
    }
  } finally {
    editorLoading.value = false;
  }
});

async function handleSubmit(values: {
  title: string;
  notes: string;
  dueAt: string;
  remindBeforeDays: number;
}) {
  if (submitting.value) {
    return;
  }

  submitting.value = true;
  const timestamp = nowIso();
  const dueAt = new Date(values.dueAt).toISOString();

  try {
    if (isEditMode.value && existingTask.value) {
      await taskStore.saveTask({
        ...existingTask.value,
        title: values.title,
        notes: values.notes,
        dueAt,
        remindBeforeDays: values.remindBeforeDays,
        triggerAt: computeTriggerAt(dueAt, values.remindBeforeDays),
        updatedAt: timestamp,
      });
    } else {
      await taskStore.createNewTask({
        id: crypto.randomUUID(),
        title: values.title,
        notes: values.notes,
        dueAt,
        remindBeforeDays: values.remindBeforeDays,
        triggerAt: computeTriggerAt(dueAt, values.remindBeforeDays),
        completed: false,
        archived: false,
        notifiedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    await router.push("/");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      :title="isEditMode ? t('editor.editTitle') : t('editor.newTitle')"
      :description="isEditMode ? t('editor.editDescription') : t('editor.newDescription')"
    />

    <LoadingState
      v-if="taskStore.loading || editorLoading"
      :title="t('loading.editorTitle')"
      :description="t('loading.editorDescription')"
    />

    <div v-else-if="missingTask" class="empty-state">
      <h3>{{ t("editor.notFoundTitle") }}</h3>
      <p>{{ t("editor.notFoundDescription") }}</p>
    </div>

    <TaskForm
      v-else
      :initial-values="initialValues"
      :submit-label="isEditMode ? t('editor.editSubmit') : t('editor.createSubmit')"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </section>
</template>
