// Example tasks for a first-time visitor, matching the design mock-up.
export function sampleTasks(dateKey) {
  const now = new Date().toISOString();
  const rows = [
    ["Finishing Wireframe", "09:00", "10:30", "high", "in_progress"],
    ["Meeting with team", "11:00", "12:00", "medium", "in_progress"],
    ["Buy a cat food", "17:00", "", "low", "completed"],
    ["Finishing daily commission", "19:00", "20:00", null, "completed"],
  ];
  return rows.map(([title, startTime, endTime, priority, status]) => ({
    id: crypto.randomUUID(),
    title,
    description: "",
    date: dateKey,
    startTime,
    endTime,
    priority,
    status,
    createdAt: now,
    updatedAt: now,
  }));
}
