import dayjs from "dayjs";

export function nowIso() {
  return dayjs().toISOString();
}

export function todayKey() {
  return dayjs().format("YYYY-MM-DD");
}

export function formatDateTime(value: string) {
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

export function formatLocalInputDateTime(value: string) {
  return dayjs(value).format("YYYY-MM-DDTHH:mm");
}

export function formatMonthLabel(value: string) {
  return dayjs(value).format("MMMM YYYY");
}

export function formatLongDate(value: string) {
  return dayjs(value).format("dddd, MMMM D");
}

export function toDateKey(value: string) {
  return dayjs(value).format("YYYY-MM-DD");
}

export function addDays(value: string, days: number) {
  return dayjs(value).add(days, "day").toISOString();
}

export function addMonths(value: string, months: number) {
  return dayjs(value).add(months, "month").toISOString();
}

export function getMonthGrid(value: string) {
  const monthStart = dayjs(value).startOf("month");
  const gridStart = monthStart.startOf("week");

  return Array.from({ length: 42 }, (_, index) => {
    const date = gridStart.add(index, "day");

    return {
      key: date.format("YYYY-MM-DD"),
      dayNumber: date.date(),
      iso: date.toISOString(),
      isCurrentMonth: date.month() === monthStart.month(),
    };
  });
}
