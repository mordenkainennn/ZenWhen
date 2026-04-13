import type { Task } from "@/types/task";

export interface TaskRepository {
  list(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Task): Promise<void>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
