import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { listTasks, saveTask, saveTasks } from "@/lib/store";
import { sampleTasks } from "@/lib/seed";
import { timeRangeError, validateTask } from "@/lib/tasks";
import { isDateKey, toKey } from "@/lib/dates";

// GET /api/tasks?q=keyword&today=YYYY-MM-DD
export async function GET(request) {
  try {
    const { uid, isNew } = await getUserId();
    const { searchParams } = new URL(request.url);

    if (isNew) {
      const today = searchParams.get("today");
      await saveTasks(uid, sampleTasks(isDateKey(today) ? today : toKey(new Date())));
    }

    const tasks = await listTasks(uid, searchParams.get("q") || "");
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not load tasks" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request) {
  try {
    const { uid } = await getUserId();
    const body = await request.json().catch(() => null);
    const { data, error } = validateTask(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const now = new Date().toISOString();
    const task = {
      id: crypto.randomUUID(),
      description: "",
      endTime: "",
      priority: null,
      status: "in_progress",
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const rangeError = timeRangeError(task);
    if (rangeError) return NextResponse.json({ error: rangeError }, { status: 400 });

    await saveTask(uid, task);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create task" }, { status: 500 });
  }
}
