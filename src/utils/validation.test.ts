import { describe, expect, it } from "vitest";
import { validateTaskInput } from "@/utils/validation";

describe("task input validation", () => {
  it("requires a non-empty title", () => {
    expect(
      validateTaskInput({
        title: "   ",
        dueAt: "2026-04-20T18:00",
        remindBeforeDays: 7,
      }),
    ).toBe("error.titleRequired");
  });

  it("requires a due time", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "",
        remindBeforeDays: 7,
      }),
    ).toBe("error.dueRequired");
  });

  it("rejects negative reminder values", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "2026-04-20T18:00",
        remindBeforeDays: -1,
      }),
    ).toBe("error.remindNonNegative");
  });

  it("accepts valid task input", () => {
    expect(
      validateTaskInput({
        title: "Pay rent",
        dueAt: "2026-04-20T18:00",
        remindBeforeDays: 7,
      }),
    ).toBe("");
  });
});
