"use client";

import { useRef, useState } from "react";
import { useTasks } from "./TasksProvider";
import { CheckIcon, EditIcon, TrashIcon } from "./Icons";
import { formatShortDate, formatTime } from "@/lib/dates";

const REVEAL = 84;
const LEAVE_MS = 280;

const priorityDot = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-red-500",
};

export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-brand transition-[background-color,transform] duration-200 active:scale-75 ${
        checked ? "bg-[#eef1fd]" : "bg-white"
      }`}
    >
      {checked && <CheckIcon className="animate-check-pop h-3.5 w-3.5 text-brand" strokeWidth={2.4} />}
    </button>
  );
}

// Swipe a row left to reveal a Delete button (works with touch and mouse).
function SwipeToDelete({ onDelete, children }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const suppressClick = useRef(false);

  const onPointerDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, base: offset, active: false, id: e.pointerId };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (Math.abs(dx) < 8) return;
      d.active = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(d.id);
    }
    setOffset(Math.max(-REVEAL - 24, Math.min(0, d.base + dx)));
  };

  const onPointerEnd = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClick.current = true;
    setDragging(false);
    setOffset((o) => (o < -REVEAL / 2 ? -REVEAL : 0));
  };

  return (
    <div className="relative overflow-hidden">
      <button
        type="button"
        onClick={async () => {
          if (!(await onDelete())) setOffset(0);
        }}
        tabIndex={offset === 0 ? -1 : 0}
        aria-hidden={offset === 0}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-sm font-medium text-white"
        style={{ width: REVEAL, visibility: offset === 0 && !dragging ? "hidden" : "visible" }}
      >
        Delete
      </button>
      <div
        className={`relative bg-white touch-pan-y select-none ${dragging ? "" : "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            e.stopPropagation();
            e.preventDefault();
          } else if (offset !== 0) {
            setOffset(0);
            e.stopPropagation();
            e.preventDefault();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

function highlight(text, query) {
  const q = query?.trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-brand-soft/70 text-inherit">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function TaskRow({ task, index = 0, showActions = true, showDate = false, query }) {
  const { toggleTask, removeTask, openEdit, confirmDelete } = useTasks();
  const [leaving, setLeaving] = useState(false);
  const done = task.status === "completed";
  const time = task.endTime
    ? `${formatTime(task.startTime)} – ${formatTime(task.endTime)}`
    : formatTime(task.startTime);

  // Asks for confirmation, then collapses the row before it's removed.
  const handleDelete = async () => {
    if (!(await confirmDelete(task))) return false;
    setLeaving(true);
    setTimeout(() => removeTask(task), LEAVE_MS);
    return true;
  };

  return (
    <div
      className={`animate-fade-up grid transition-[grid-template-rows,opacity,translate] duration-300 ease-in ${
        leaving ? "pointer-events-none -translate-x-8 grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
      }`}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="min-h-0 overflow-hidden">
        <SwipeToDelete onDelete={handleDelete}>
          <div className="flex items-stretch gap-4">
            <div className="flex items-center">
              <Checkbox
                checked={done}
                onChange={() => toggleTask(task)}
                label={`Mark "${task.title}" as ${done ? "in progress" : "completed"}`}
              />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 border-b border-line py-3">
              <button type="button" onClick={() => openEdit(task)} className="min-w-0 flex-1 text-left">
                <span
                  className={`block truncate text-sm transition-colors duration-300 ${done ? "text-ink/75" : "text-ink"}`}
                >
                  {/* Strike-through drawn as a background line so it can animate across the title. */}
                  <span
                    className="bg-no-repeat transition-[background-size] duration-300 ease-out"
                    style={{
                      backgroundImage: "linear-gradient(currentColor, currentColor)",
                      backgroundPosition: "0 55%",
                      backgroundSize: done ? "100% 1px" : "0% 1px",
                    }}
                  >
                    {highlight(task.title, query)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                  {task.priority && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${priorityDot[task.priority]}`}
                      aria-label={`${task.priority} priority`}
                    />
                  )}
                  {showDate ? `${formatShortDate(task.date)} · ${time}` : time}
                </span>
              </button>
              {showActions && (
                <div className="flex shrink-0 items-center gap-2 text-[#c6c6cc]">
                  <button
                    type="button"
                    onClick={handleDelete}
                    aria-label={`Delete "${task.title}"`}
                    className="p-0.5 transition-[color,transform] hover:text-red-500 active:scale-90"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(task)}
                    aria-label={`Edit "${task.title}"`}
                    className="p-0.5 transition-[color,transform] hover:text-brand active:scale-90"
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </SwipeToDelete>
      </div>
    </div>
  );
}
