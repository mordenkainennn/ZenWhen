import { db } from "@/db/dexie";
import type { TaskRepository } from "@/repository/task-repository";

export const dexieTaskRepository: TaskRepository = {
  async list() {
    return db.tasks.orderBy("updatedAt").reverse().toArray();
  },

  async getById(id) {
    return (await db.tasks.get(id)) ?? null;
  },

  async create(task) {
    await db.tasks.add(task);
  },

  async update(task) {
    await db.tasks.put(task);
  },

  async delete(id) {
    await db.tasks.delete(id);
  },
};
