import { createFallbackTaskRepository, createTaskRepository } from "@/services/storage-service";
import type { Task } from "@/types/task";
import { computeTriggerAt } from "@/utils/task";

const primaryRepository = createTaskRepository();
const fallbackRepository = createFallbackTaskRepository();

type LegacyTask = Task & {
  remindBeforeMinutes?: number;
  remindBeforeDays?: number;
};

function normalizeReminderDays(task: LegacyTask) {
  if (typeof task.remindBeforeDays === "number") {
    return task.remindBeforeDays;
  }

  if (typeof task.remindBeforeMinutes === "number") {
    if (task.remindBeforeMinutes === 0) {
      return 0;
    }

    return Math.max(1, Math.round(task.remindBeforeMinutes / 1440));
  }

  return 7;
}

function normalizeTask(task: LegacyTask): Task {
  const remindBeforeDays = normalizeReminderDays(task);

  return {
    ...task,
    remindBeforeDays,
    triggerAt: computeTriggerAt(task.dueAt, remindBeforeDays),
  };
}

async function withFallback<T>(operation: (repository: typeof primaryRepository) => Promise<T>) {
  try {
    return await operation(primaryRepository);
  } catch (error) {
    console.warn("Primary task repository failed, falling back to localStorage.", error);
    return operation(fallbackRepository);
  }
}

export async function listTasks() {
  const tasks = await withFallback((repository) => repository.list());
  return tasks.map((task) => normalizeTask(task as LegacyTask));
}

export async function getTaskById(id: string) {
  const task = await withFallback((repository) => repository.getById(id));
  return task ? normalizeTask(task as LegacyTask) : null;
}

export async function createTask(task: Task) {
  return withFallback((repository) => repository.create(task));
}

export async function updateTask(task: Task) {
  return withFallback((repository) => repository.update(task));
}

export async function deleteTask(id: string) {
  return withFallback((repository) => repository.delete(id));
}
