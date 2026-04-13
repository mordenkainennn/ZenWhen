import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { scanAndNotifyTasks } from "@/services/notification-service";
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

  async function refreshTasks() {
    tasks.value = await listTasks();
  }

  async function syncTriggeredNotifications() {
    await scanAndNotifyTasks(tasks.value);
    await refreshTasks();
  }

  async function loadTasks() {
    loading.value = true;

    try {
      await refreshTasks();
    } finally {
      loading.value = false;
    }
  }

  async function loadTasksAndSyncNotifications() {
    loading.value = true;

    try {
      await refreshTasks();
      await syncTriggeredNotifications();
    } finally {
      loading.value = false;
    }
  }

  async function createNewTask(task: Task) {
    await createTask(task);
    await refreshTasks();
    await syncTriggeredNotifications();
  }

  async function saveTask(task: Task) {
    await updateTask(task);
    await refreshTasks();
    await syncTriggeredNotifications();
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

    await refreshTasks();
    await syncTriggeredNotifications();
  }

  async function removeTask(id: string) {
    await deleteTask(id);
    await refreshTasks();
    await syncTriggeredNotifications();
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
    refreshTasks,
    syncTriggeredNotifications,
    loadTasks,
    loadTasksAndSyncNotifications,
    createNewTask,
    saveTask,
    completeTask,
    removeTask,
    findTask,
    setNotificationPermission,
  };
});
