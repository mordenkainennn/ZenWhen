import Dexie, { type Table } from "dexie";
import type { Task } from "@/types/task";

export class ZenWhenDatabase extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super("zenwhen");

    this.version(1).stores({
      tasks: "id,dueAt,triggerAt,completed,archived,updatedAt",
    });
  }
}

export const db = new ZenWhenDatabase();
