import type { TaskRepository } from "@/repository/task-repository";
import type { Task } from "@/types/task";

const STORAGE_KEY = "zenwhen.tasks";

function readTasks() {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [] as Task[];
  }

  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const localStorageTaskRepository: TaskRepository = {
  async list() {
    return readTasks();
  },

  async getById(id) {
    return readTasks().find((task) => task.id === id) ?? null;
  },

  async create(task) {
    const tasks = readTasks();
    tasks.push(task);
    writeTasks(tasks);
  },

  async update(task) {
    const tasks = readTasks().map((item) => (item.id === task.id ? task : item));
    writeTasks(tasks);
  },

  async delete(id) {
    const tasks = readTasks().filter((task) => task.id !== id);
    writeTasks(tasks);
  },
};
