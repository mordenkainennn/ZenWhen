import dayjs from "dayjs";

export function nowIso() {
  return dayjs().toISOString();
}

export function formatDateTime(value: string) {
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

export function addDays(value: string, days: number) {
  return dayjs(value).add(days, "day").toISOString();
}
