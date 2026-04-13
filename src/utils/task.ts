import dayjs from "dayjs";
import type { Task } from "@/types/task";

export function computeTriggerAt(dueAt: string, remindBeforeMinutes: number) {
  return dayjs(dueAt).subtract(remindBeforeMinutes, "minute").toISOString();
}

export function isReminderTask(task: Task, now: string) {
  return now >= task.triggerAt && !task.completed && !task.archived;
}

export function isInboxTask(task: Task, now: string) {
  return now < task.triggerAt && !task.completed && !task.archived;
}

export function isReviewTask(task: Task, now: string, end: string) {
  return task.dueAt >= now && task.dueAt <= end && !task.completed && !task.archived;
}

export function isOverdueTask(task: Task, now: string) {
  return task.dueAt < now && !task.completed && !task.archived;
}

export function sortReminderTasks(tasks: Task[], now: string) {
  return [...tasks].sort((left, right) => {
    const leftOverdue = isOverdueTask(left, now) ? 0 : 1;
    const rightOverdue = isOverdueTask(right, now) ? 0 : 1;

    if (leftOverdue !== rightOverdue) {
      return leftOverdue - rightOverdue;
    }

    if (left.dueAt !== right.dueAt) {
      return left.dueAt.localeCompare(right.dueAt);
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}
