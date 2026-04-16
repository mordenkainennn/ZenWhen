export interface Task {
  id: string;
  title: string;
  notes: string;
  dueAt: string;
  remindBeforeDays: number;
  triggerAt: string;
  completed: boolean;
  archived: boolean;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskPhase = "reminder" | "inbox" | "review";
