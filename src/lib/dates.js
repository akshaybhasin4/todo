// All task dates are stored as local "YYYY-MM-DD" keys and times as "HH:MM",
// so nothing shifts when the server and the browser are in different timezones.

const pad = (n) => String(n).padStart(2, "0");

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isDateKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toKey(fromKey(value)) === value;
}

export function todayKey() {
  return toKey(new Date());
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// Weeks run Monday → Sunday.
export function startOfWeek(date) {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return addDays(day, -((day.getDay() + 6) % 7));
}

export function weekKeyOf(dateKey) {
  return toKey(startOfWeek(fromKey(dateKey)));
}

export function weekDays(dateKey) {
  const start = startOfWeek(fromKey(dateKey));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function shiftKey(dateKey, days) {
  return toKey(addDays(fromKey(dateKey), days));
}

// "Friday 14, January" — the format used in the design.
export function formatLongDate(dateKey) {
  const d = fromKey(dateKey);
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${weekday} ${d.getDate()}, ${month}${year}`;
}

export function formatShortDate(dateKey) {
  return fromKey(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatWeekRange(weekKey) {
  const start = fromKey(weekKey);
  const end = addDays(start, 6);
  const fmt = (d, withMonth) =>
    d.toLocaleDateString("en-US", withMonth ? { day: "numeric", month: "short" } : { day: "numeric" });
  const sameMonth = start.getMonth() === end.getMonth();
  return `${fmt(start, !sameMonth)} – ${fmt(end, true)}`;
}

export function formatTime(time) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
}
