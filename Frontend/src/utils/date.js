export const DAY_KEYS = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
export const DAY_SHORT = {
  SUNDAY:"SUN", MONDAY:"MON", TUESDAY:"TUE",
  WEDNESDAY:"WED", THURSDAY:"THU", FRIDAY:"FRI", SATURDAY:"SAT"
};

export function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYmdToLocalDate(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatDate(ymd) {
  const date = parseYmdToLocalDate(ymd);
  if (!date) return ymd;
  return date.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}