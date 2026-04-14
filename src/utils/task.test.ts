import { describe, expect, it } from "vitest";
import type { Task } from "@/types/task";
import {
  computeTriggerAt,
  getInboxStatus,
  getReminderStatus,
  isInboxTask,
  isReminderTask,
  isReviewTask,
  sortReminderTasks,
} from "@/utils/task";

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Test task",
    notes: "",
    dueAt: "2026-04-20T10:00:00.000Z",
    remindBeforeMinutes: 60,
    triggerAt: "2026-04-20T09:00:00.000Z",
    completed: false,
    archived: false,
    notifiedAt: null,
    createdAt: "2026-04-10T08:00:00.000Z",
    updatedAt: "2026-04-10T08:00:00.000Z",
    ...overrides,
  };
}

describe("task utilities", () => {
  it("computes triggerAt from dueAt and reminder offset", () => {
    expect(computeTriggerAt("2026-04-20T10:00:00.000Z", 90)).toBe("2026-04-20T08:30:00.000Z");
  });

  it("classifies reminder and inbox tasks around triggerAt", () => {
    const task = createTask();

    expect(isInboxTask(task, "2026-04-20T08:59:59.000Z")).toBe(true);
    expect(isReminderTask(task, "2026-04-20T09:00:00.000Z")).toBe(true);
  });

  it("limits review tasks to the configured window", () => {
    const task = createTask({ dueAt: "2026-04-25T10:00:00.000Z" });

    expect(
      isReviewTask(task, "2026-04-20T00:00:00.000Z", "2026-05-05T00:00:00.000Z"),
    ).toBe(true);
    expect(
      isReviewTask(task, "2026-04-20T00:00:00.000Z", "2026-04-22T00:00:00.000Z"),
    ).toBe(false);
  });

  it("returns overdue, today, and upcoming reminder statuses", () => {
    expect(
      getReminderStatus(
        createTask({ dueAt: "2026-04-19T23:00:00+08:00" }),
        "2026-04-20T09:00:00+08:00",
      ).key,
    ).toBe("overdue");

    expect(
      getReminderStatus(
        createTask({ dueAt: "2026-04-20T18:00:00+08:00" }),
        "2026-04-20T09:00:00+08:00",
      ).key,
    ).toBe("today");

    expect(
      getReminderStatus(
        createTask({ dueAt: "2026-04-21T18:00:00+08:00" }),
        "2026-04-20T09:00:00+08:00",
      ).key,
    ).toBe("upcoming");
  });

  it("returns inbox statuses based on trigger date", () => {
    expect(
      getInboxStatus(
        createTask({ triggerAt: "2026-04-20T15:00:00+08:00" }),
        "2026-04-20T09:00:00+08:00",
      ).key,
    ).toBe("surfacesToday");

    expect(
      getInboxStatus(
        createTask({ triggerAt: "2026-04-21T15:00:00+08:00" }),
        "2026-04-20T09:00:00+08:00",
      ).key,
    ).toBe("hidden");
  });

  it("compares date-time by instant instead of raw string order", () => {
    const task = createTask({
      dueAt: "2026-04-20T00:30:00+09:00",
      triggerAt: "2026-04-19T23:30:00+09:00",
    });

    expect(isReminderTask(task, "2026-04-19T15:00:00.000Z")).toBe(true);
    expect(isReviewTask(task, "2026-04-19T16:00:00.000Z", "2026-04-21T00:00:00.000Z")).toBe(
      false,
    );
  });

  it("sorts reminder tasks with overdue items first, then dueAt, then createdAt", () => {
    const now = "2026-04-20T12:00:00.000Z";
    const tasks = [
      createTask({
        id: "today-late-created",
        dueAt: "2026-04-20T18:00:00.000Z",
        createdAt: "2026-04-10T09:00:00.000Z",
      }),
      createTask({
        id: "overdue",
        dueAt: "2026-04-19T23:00:00.000Z",
        createdAt: "2026-04-10T10:00:00.000Z",
      }),
      createTask({
        id: "today-early-created",
        dueAt: "2026-04-20T18:00:00.000Z",
        createdAt: "2026-04-10T08:00:00.000Z",
      }),
      createTask({
        id: "upcoming",
        dueAt: "2026-04-21T18:00:00.000Z",
      }),
    ];

    expect(sortReminderTasks(tasks, now).map((task) => task.id)).toEqual([
      "overdue",
      "today-early-created",
      "today-late-created",
      "upcoming",
    ]);
  });
});
