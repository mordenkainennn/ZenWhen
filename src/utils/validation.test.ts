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
    ).toBe("error.titleRequired");
  });

  it("requires a due time", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "",
        remindBeforeMinutes: 60,
      }),
    ).toBe("error.dueRequired");
  });

  it("rejects negative reminder values", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "2026-04-20T18:00",
        remindBeforeMinutes: -5,
      }),
    ).toBe("error.remindNonNegative");
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
