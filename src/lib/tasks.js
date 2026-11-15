import { isDateKey } from "./dates";

export const PRIORITIES = ["low", "medium", "high"];
export const STATUSES = ["in_progress", "completed"];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.startTime.localeCompare(b.startTime) ||
      a.createdAt.localeCompare(b.createdAt)
  );
}

export function matchesQuery(task, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return task.title.toLowerCase().includes(q) || (task.description || "").toLowerCase().includes(q);
}

// Validates a create payload (partial = false) or an update payload (partial = true).
// Returns { data } with only the recognised, normalised fields, or { error }.
export function validateTask(input, { partial = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Invalid request body" };
  }
  const data = {};

  if (!partial || "title" in input) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (!title) return { error: "Title is required" };
    if (title.length > 120) return { error: "Title must be 120 characters or fewer" };
    data.title = title;
  }

  if ("description" in input) {
    const description = input.description ?? "";
    if (typeof description !== "string") return { error: "Description must be text" };
    if (description.length > 1000) return { error: "Description must be 1000 characters or fewer" };
    data.description = description.trim();
  }

  if (!partial || "date" in input) {
    if (!isDateKey(input.date)) return { error: "A valid date is required" };
    data.date = input.date;
  }

  if (!partial || "startTime" in input) {
    if (!TIME_RE.test(input.startTime ?? "")) return { error: "A valid start time is required" };
    data.startTime = input.startTime;
  }

  if ("endTime" in input) {
    const endTime = input.endTime ?? "";
    if (endTime !== "" && !TIME_RE.test(endTime)) return { error: "End time is invalid" };
    data.endTime = endTime;
  }

  if ("priority" in input) {
    const priority = input.priority ?? null;
    if (priority !== null && !PRIORITIES.includes(priority)) return { error: "Priority is invalid" };
    data.priority = priority;
  }

  if ("status" in input) {
    if (!STATUSES.includes(input.status)) return { error: "Status is invalid" };
    data.status = input.status;
  }

  return { data };
}

export function timeRangeError(task) {
  if (task.endTime && task.endTime <= task.startTime) return "End time must be after start time";
  return null;
}
