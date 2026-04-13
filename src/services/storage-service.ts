import { dexieTaskRepository } from "@/repository/dexie-task-repository";
import { localStorageTaskRepository } from "@/repository/localstorage-task-repository";
import type { TaskRepository } from "@/repository/task-repository";

export function createTaskRepository(): TaskRepository {
  return dexieTaskRepository;
}

export function createFallbackTaskRepository(): TaskRepository {
  return localStorageTaskRepository;
}
