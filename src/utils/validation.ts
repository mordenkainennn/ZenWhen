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
    return "Title is required.";
  }

  if (title.length > 120) {
    return "Title must be 120 characters or fewer.";
  }

  if (!input.dueAt) {
    return "Due time is required.";
  }

  if (!Number.isFinite(input.remindBeforeMinutes) || input.remindBeforeMinutes < 0) {
    return "Remind before must be a non-negative number.";
  }

  return "";
}
