import { updateTask } from "@/services/task-service";
import type { Task } from "@/types/task";
import { nowIso } from "@/utils/date";

export async function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  await navigator.serviceWorker.register("/service-worker.js");
}

export async function scanAndNotifyTasks(tasks: Task[]) {
  const permission = await getNotificationPermission();

  if (permission !== "granted") {
    return;
  }

  const now = nowIso();
  const dueTasks = tasks.filter(
    (task) =>
      !task.completed &&
      !task.archived &&
      !task.notifiedAt &&
      now >= task.triggerAt,
  );

  for (const task of dueTasks) {
    new Notification(task.title, {
      body: `Due ${new Date(task.dueAt).toLocaleString()}`,
      tag: `task-${task.id}`,
    });

    await updateTask({
      ...task,
      notifiedAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}
