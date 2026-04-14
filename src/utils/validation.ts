export const REMINDER_PRESETS = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "3h", minutes: 180 },
  { label: "1d", minutes: 1440 },
];

export function validateTaskInput(input: {
  title: string;
  dueAt: string;
  remindBeforeMinutes: number;
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

  if (!Number.isFinite(input.remindBeforeMinutes) || input.remindBeforeMinutes < 0) {
    return "error.remindNonNegative";
  }

  return "";
}
