import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { createTask, deleteTask, getTaskById, listTasks, updateTask } from "@/services/task-service";
import type { Task } from "@/types/task";
import { addDays, nowIso } from "@/utils/date";
import { isInboxTask, isReviewTask, isReminderTask, sortReminderTasks } from "@/utils/task";

type NotificationPermissionState = NotificationPermission | "unsupported";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const notificationPermission = ref<NotificationPermissionState>("default");

  const reminderTasks = computed(() => {
    const now = nowIso();
    return sortReminderTasks(tasks.value.filter((task) => isReminderTask(task, now)), now);
  });

  const inboxTasks = computed(() => {
    const now = nowIso();
    return [...tasks.value.filter((task) => isInboxTask(task, now))].sort((left, right) =>
      left.triggerAt.localeCompare(right.triggerAt),
    );
  });

  const reviewTasks = computed(() => {
    const now = nowIso();
    const end = addDays(now, 15);
    return [...tasks.value.filter((task) => isReviewTask(task, now, end))].sort((left, right) =>
      left.dueAt.localeCompare(right.dueAt),
    );
  });

  async function loadTasks() {
    loading.value = true;

    try {
      tasks.value = await listTasks();
    } finally {
      loading.value = false;
    }
  }

  async function createNewTask(task: Task) {
    await createTask(task);
    tasks.value = await listTasks();
  }

  async function saveTask(task: Task) {
    await updateTask(task);
    tasks.value = await listTasks();
  }

  async function completeTask(id: string) {
    const target = tasks.value.find((task) => task.id === id);

    if (!target) {
      return;
    }

    await updateTask({
      ...target,
      completed: true,
      updatedAt: nowIso(),
    });

    tasks.value = await listTasks();
  }

  async function removeTask(id: string) {
    await deleteTask(id);
    tasks.value = await listTasks();
  }

  async function findTask(id: string) {
    return getTaskById(id);
  }

  function setNotificationPermission(value: NotificationPermissionState) {
    notificationPermission.value = value;
  }

  return {
    tasks,
    loading,
    notificationPermission,
    reminderTasks,
    inboxTasks,
    reviewTasks,
    loadTasks,
    createNewTask,
    saveTask,
    completeTask,
    removeTask,
    findTask,
    setNotificationPermission,
  };
});
