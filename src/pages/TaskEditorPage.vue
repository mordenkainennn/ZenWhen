<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
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

const initialValues = computed(() => ({
  title: existingTask.value?.title ?? "",
  notes: existingTask.value?.notes ?? "",
  dueAt: existingTask.value ? formatLocalInputDateTime(existingTask.value.dueAt) : "",
  remindBeforeMinutes: existingTask.value?.remindBeforeMinutes ?? 60,
}));

const isEditMode = computed(() => Boolean(props.id));

onMounted(async () => {
  if (!taskStore.tasks.length) {
    await taskStore.loadTasks();
  }

  if (props.id) {
    existingTask.value = await taskStore.findTask(props.id);
  }
});

async function handleSubmit(values: {
  title: string;
  notes: string;
  dueAt: string;
  remindBeforeMinutes: number;
}) {
  const timestamp = nowIso();
  const dueAt = new Date(values.dueAt).toISOString();

  if (isEditMode.value && existingTask.value) {
    await taskStore.saveTask({
      ...existingTask.value,
      title: values.title,
      notes: values.notes,
      dueAt,
      remindBeforeMinutes: values.remindBeforeMinutes,
      triggerAt: computeTriggerAt(dueAt, values.remindBeforeMinutes),
      updatedAt: timestamp,
    });
  } else {
    await taskStore.createNewTask({
      id: crypto.randomUUID(),
      title: values.title,
      notes: values.notes,
      dueAt,
      remindBeforeMinutes: values.remindBeforeMinutes,
      triggerAt: computeTriggerAt(dueAt, values.remindBeforeMinutes),
      completed: false,
      archived: false,
      notifiedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  await router.push("/");
}
</script>

<template>
  <section class="page-stack">
    <PageHeader
      :title="isEditMode ? 'Edit Task' : 'New Task'"
      :description="
        isEditMode
          ? 'Adjust the due time or lead time and ZenWhen will recompute triggerAt.'
          : 'Create a task and decide when it should surface into your reminder view.'
      "
    />

    <TaskForm
      :initial-values="initialValues"
      :submit-label="isEditMode ? 'Save Changes' : 'Create Task'"
      @submit="handleSubmit"
    />
  </section>
</template>
