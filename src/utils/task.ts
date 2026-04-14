import dayjs from "dayjs";
import type { Task } from "@/types/task";

function toTime(value: string) {
  return dayjs(value).valueOf();
}

export function computeTriggerAt(dueAt: string, remindBeforeMinutes: number) {
  return dayjs(dueAt).subtract(remindBeforeMinutes, "minute").toISOString();
}

export function isReminderTask(task: Task, now: string) {
  return toTime(now) >= toTime(task.triggerAt) && !task.completed && !task.archived;
}

export function isInboxTask(task: Task, now: string) {
  return toTime(now) < toTime(task.triggerAt) && !task.completed && !task.archived;
}

export function isReviewTask(task: Task, now: string, end: string) {
  const dueAtTime = toTime(task.dueAt);
  return dueAtTime >= toTime(now) && dueAtTime <= toTime(end) && !task.completed && !task.archived;
}

export function isOverdueTask(task: Task, now: string) {
  return toTime(task.dueAt) < toTime(now) && !task.completed && !task.archived;
}

export function getReminderStatus(task: Task, now: string) {
  if (isOverdueTask(task, now)) {
    return {
      key: "overdue" as const,
      tone: "overdue" as const,
    };
  }

  if (dayjs(task.dueAt).isSame(dayjs(now), "day")) {
    return {
      key: "today" as const,
      tone: "today" as const,
    };
  }

  return {
    key: "upcoming" as const,
    tone: "upcoming" as const,
  };
}

export function getInboxStatus(task: Task, now: string) {
  if (dayjs(task.triggerAt).isSame(dayjs(now), "day")) {
    return {
      key: "surfacesToday" as const,
      tone: "today" as const,
    };
  }

  return {
    key: "hidden" as const,
    tone: "hidden" as const,
  };
}

export function sortReminderTasks(tasks: Task[], now: string) {
  return [...tasks].sort((left, right) => {
    const leftOverdue = isOverdueTask(left, now) ? 0 : 1;
    const rightOverdue = isOverdueTask(right, now) ? 0 : 1;

    if (leftOverdue !== rightOverdue) {
      return leftOverdue - rightOverdue;
    }

    const dueAtDiff = toTime(left.dueAt) - toTime(right.dueAt);

    if (dueAtDiff !== 0) {
      return dueAtDiff;
    }

    return toTime(left.createdAt) - toTime(right.createdAt);
  });
}
