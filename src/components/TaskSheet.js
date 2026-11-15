"use client";

import { useCallback, useEffect, useState } from "react";
import { useTasks } from "./TasksProvider";
import { CalendarIcon, ClockIcon, CloseIcon } from "./Icons";
import { formatLongDate, formatTime, todayKey } from "@/lib/dates";
import { PRIORITIES } from "@/lib/tasks";

const inputBox = "border border-[#e3e3e8] bg-white text-ink transition-colors focus-within:border-brand";

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs text-[#55555c]">
      {children}
    </label>
  );
}

// A styled field with a transparent native date/time input on top, so the
// platform's own picker opens on tap while the design's look is kept.
function PickerField({ type, value, onChange, display, placeholder, icon, iconRight, label, invalid }) {
  return (
    <div className={`relative flex h-11 items-center gap-2.5 px-3 text-sm ${inputBox} ${invalid ? "animate-shake border-red-400" : ""}`}>
      {!iconRight && icon}
      <span className={`flex-1 truncate ${value ? "" : "text-ink"}`}>{value ? display : placeholder}</span>
      {iconRight && icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker();
          } catch {}
        }}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active && opt.toggle ? null : opt.value)}
            className={`flex h-10 items-center justify-center gap-2 border text-[13px] transition-colors ${
              active ? "border-brand bg-[#eef1fd] text-brand" : "border-[#e3e3e8] text-[#55555c]"
            }`}
          >
            {opt.dot && <span className={`h-2 w-2 rounded-full ${opt.dot}`} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const priorityOptions = PRIORITIES.map((p) => ({
  value: p,
  label: p[0].toUpperCase() + p.slice(1),
  dot: { low: "bg-emerald-400", medium: "bg-amber-400", high: "bg-red-500" }[p],
  toggle: true,
}));

const statusOptions = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function TaskSheet({ mode, task, date, onClose }) {
  const { createTask, updateTask, removeTask, confirmDelete, setSelectedDate } = useTasks();
  const editing = mode === "edit";
  const [closing, setClosing] = useState(false);

  // Play the slide-down before unmounting.
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 220);
  }, [onClose]);
  const [form, setForm] = useState(() => ({
    title: task?.title ?? "",
    description: task?.description ?? "",
    date: task?.date ?? date ?? todayKey(),
    startTime: task?.startTime ?? "",
    endTime: task?.endTime ?? "",
    priority: task?.priority ?? null,
    status: task?.status ?? "in_progress",
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !document.querySelector("[role=alertdialog]") && close();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Please enter a task title";
    if (!form.startTime) next.startTime = "Please set a start time";
    if (!form.date) next.date = "Please set a date";
    if (form.endTime && form.startTime && form.endTime <= form.startTime) next.endTime = "End time must be after start time";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setSubmitError("");
    try {
      if (editing) await updateTask(task.id, form);
      else await createTask(form);
      setSelectedDate(form.date);
      close();
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  };

  const timeError = errors.startTime || errors.endTime;

  return (
    <div className="fixed inset-0 z-40 flex justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className={`absolute inset-0 cursor-default bg-[#3a3a3a]/45 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      />
      <div className="pointer-events-none relative flex h-full w-full max-w-[430px] flex-col justify-end">
        <form
          onSubmit={submit}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          className={`${closing ? "animate-sheet-down" : "animate-sheet-up"} pointer-events-auto max-h-[92dvh] overflow-y-auto bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6`}
          noValidate
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 id="sheet-title" className="text-base font-medium text-ink">
              {editing ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1 p-1 text-ink transition-transform duration-200 hover:rotate-90 active:scale-90"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="task-title">Task title</Label>
              <input
                id="task-title"
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="Doing Homework"
                maxLength={120}
                autoFocus={!editing}
                className={`h-11 w-full px-3 text-base outline-none placeholder:text-sm placeholder:text-muted sm:text-sm ${inputBox} ${
                  errors.title ? "animate-shake border-red-400" : ""
                }`}
              />
              {errors.title && <p className="animate-fade-in mt-1.5 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <Label>Set Time</Label>
              <div className="grid grid-cols-2 gap-5">
                <PickerField
                  type="time"
                  label="Start time"
                  value={form.startTime}
                  onChange={set("startTime")}
                  display={formatTime(form.startTime)}
                  placeholder="Start"
                  invalid={errors.startTime}
                  icon={<ClockIcon className="h-4 w-4 shrink-0 text-ink" />}
                />
                <PickerField
                  type="time"
                  label="End time"
                  value={form.endTime}
                  onChange={set("endTime")}
                  display={formatTime(form.endTime)}
                  placeholder="Ends"
                  invalid={errors.endTime}
                  icon={<ClockIcon className="h-4 w-4 shrink-0 text-ink" />}
                />
              </div>
              {timeError && <p className="animate-fade-in mt-1.5 text-xs text-red-500">{timeError}</p>}
            </div>

            <div>
              <Label>Set Date</Label>
              <PickerField
                type="date"
                label="Date"
                value={form.date}
                onChange={set("date")}
                display={form.date && formatLongDate(form.date)}
                placeholder="Select a date"
                invalid={errors.date}
                iconRight
                icon={<CalendarIcon className="h-4 w-4 shrink-0 text-ink" />}
              />
              {errors.date && <p className="animate-fade-in mt-1.5 text-xs text-red-500">{errors.date}</p>}
            </div>

            <div>
              <Label>Priority</Label>
              <Segmented label="Priority" options={priorityOptions} value={form.priority} onChange={set("priority")} />
            </div>

            {editing && (
              <div>
                <Label>Status</Label>
                <Segmented label="Status" options={statusOptions} value={form.status} onChange={set("status")} />
              </div>
            )}

            <div>
              <Label htmlFor="task-description">Description</Label>
              <textarea
                id="task-description"
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Add Description"
                maxLength={1000}
                rows={3}
                className={`block w-full resize-none px-3 py-3 text-base outline-none placeholder:text-sm placeholder:text-ink sm:text-sm ${inputBox}`}
              />
            </div>
          </div>

          {submitError && <p className="animate-fade-in mt-4 text-sm text-red-500">{submitError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 h-12 w-full bg-brand text-sm font-medium text-white transition-[opacity,transform] hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Create task"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={async () => {
                if (!(await confirmDelete(task))) return;
                removeTask(task);
                close();
              }}
              className="mt-3 h-11 w-full text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              Delete task
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

// Rendered once in the root layout; opens whenever a page calls openCreate/openEdit.
export default function SheetHost() {
  const { sheet, closeSheet } = useTasks();
  if (!sheet) return null;
  return <TaskSheet key={sheet.task?.id ?? "new"} {...sheet} onClose={closeSheet} />;
}
