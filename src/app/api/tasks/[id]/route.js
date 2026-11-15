import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { deleteTask, getTask, saveTask } from "@/lib/store";
import { timeRangeError, validateTask } from "@/lib/tasks";

const notFound = () => NextResponse.json({ error: "Task not found" }, { status: 404 });

export async function GET(_request, { params }) {
  const { id } = await params;
  const { uid } = await getUserId();
  const task = await getTask(uid, id);
  return task ? NextResponse.json({ task }) : notFound();
}

// PATCH /api/tasks/:id — update any subset of fields, including status.
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { uid } = await getUserId();
    const existing = await getTask(uid, id);
    if (!existing) return notFound();

    const body = await request.json().catch(() => null);
    const { data, error } = validateTask(body, { partial: true });
    if (error) return NextResponse.json({ error }, { status: 400 });

    const task = { ...existing, ...data, updatedAt: new Date().toISOString() };
    const rangeError = timeRangeError(task);
    if (rangeError) return NextResponse.json({ error: rangeError }, { status: 400 });

    await saveTask(uid, task);
    return NextResponse.json({ task });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update task" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const { uid } = await getUserId();
    const deleted = await deleteTask(uid, id);
    return deleted ? NextResponse.json({ ok: true }) : notFound();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not delete task" }, { status: 500 });
  }
}
