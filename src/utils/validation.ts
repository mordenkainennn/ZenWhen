export const REMINDER_PRESETS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

export function validateTaskInput(input: {
  title: string;
  dueAt: string;
  remindBeforeDays: number;
}) {
  const title = input.title.trim();

  if (!title) {
    return "error.titleRequired";
  }

  if (title.length > 120) {
    return "error.titleTooLong";
  }

  if (!input.dueAt) {
    return "error.dueRequired";
  }

  if (!Number.isFinite(input.remindBeforeDays) || input.remindBeforeDays < 0) {
    return "error.remindNonNegative";
  }

  return "";
}
