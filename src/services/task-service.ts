import { createFallbackTaskRepository, createTaskRepository } from "@/services/storage-service";
import type { Task } from "@/types/task";

const primaryRepository = createTaskRepository();
const fallbackRepository = createFallbackTaskRepository();

async function withFallback<T>(operation: (repository: typeof primaryRepository) => Promise<T>) {
  try {
    return await operation(primaryRepository);
  } catch (error) {
    console.warn("Primary task repository failed, falling back to localStorage.", error);
    return operation(fallbackRepository);
  }
}

export async function listTasks() {
  return withFallback((repository) => repository.list());
}

export async function getTaskById(id: string) {
  return withFallback((repository) => repository.getById(id));
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
