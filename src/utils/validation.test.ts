import { describe, expect, it } from "vitest";
import { validateTaskInput } from "@/utils/validation";

describe("task input validation", () => {
  it("requires a non-empty title", () => {
    expect(
      validateTaskInput({
        title: "   ",
        dueAt: "2026-04-20T18:00",
        remindBeforeMinutes: 60,
      }),
    ).toBe("Title is required.");
  });

  it("requires a due time", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "",
        remindBeforeMinutes: 60,
      }),
    ).toBe("Due time is required.");
  });

  it("rejects negative reminder values", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "2026-04-20T18:00",
        remindBeforeMinutes: -5,
      }),
    ).toBe("Remind before must be a non-negative number.");
  });

  it("accepts valid task input", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "2026-04-20T18:00",
        remindBeforeMinutes: 60,
      }),
    ).toBe("");
  });
});
