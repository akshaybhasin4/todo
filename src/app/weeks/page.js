"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/components/TasksProvider";
import TaskRow from "@/components/TaskRow";
import AnimatedNumber from "@/components/AnimatedNumber";
import Credit from "@/components/Credit";
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, CloseIcon, PlusIcon } from "@/components/Icons";
import { formatShortDate, formatWeekRange, todayKey, weekKeyOf } from "@/lib/dates";

function WeekCard({ weekKey, tasks, open, onToggle, index }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const openCount = tasks.length - completed;
  const progress = tasks.length ? (completed / tasks.length) * 100 : 0;
  const isThisWeek = weekKey === weekKeyOf(todayKey());

  const byDay = tasks.reduce((acc, t) => {
    (acc[t.date] ||= []).push(t);
    return acc;
  }, {});

  return (
    <section className="animate-fade-up border border-line transition-shadow duration-300 hover:shadow-sm" style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full px-4 pb-4 pt-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{formatWeekRange(weekKey)}</p>
            <p className="mt-0.5 text-[11px] text-muted">
              {isThisWeek ? "This Week" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
            </p>
          </div>
          <ChevronDownIcon className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-[2px] bg-[#eef1fd] px-3 py-2">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border-[1.5px] border-brand bg-[#a9b8f4] text-brand-dark">
              <CheckIcon className="h-3 w-3" strokeWidth={2.4} />
            </span>
            <span className="text-[11px] text-ink">Completed</span>
            <span className="ml-auto text-sm font-semibold text-ink tabular-nums"><AnimatedNumber value={completed} pad={1} /></span>
          </div>
          <div className="flex items-center gap-2 rounded-[2px] bg-[#fde3e3] px-3 py-2">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border-[1.5px] border-[#e5484d] bg-[#f6a9a9] text-[#d92d33]">
              <CloseIcon className="h-3 w-3" strokeWidth={2.4} />
            </span>
            <span className="text-[11px] text-ink">Open</span>
            <span className="ml-auto text-sm font-semibold text-ink tabular-nums"><AnimatedNumber value={openCount} pad={1} /></span>
          </div>
        </div>

        <div className="mt-3 h-1.5 bg-brand-soft">
          <div className="h-full bg-brand-dark transition-[width] duration-700" style={{ width: `${progress}%` }} />
        </div>
      </button>

      <div
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line px-4 pb-2">
            {open &&
              Object.entries(byDay).map(([date, dayTasks]) => (
                <div key={date} className="pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{formatShortDate(date)}</p>
                  {dayTasks.map((task, i) => (
                    <TaskRow key={task.id} task={task} index={i} />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Weeks() {
  const { tasks, loading, openCreate } = useTasks();
  const params = useSearchParams();
  const initialWeek = params.get("week") || weekKeyOf(todayKey());
  const [expanded, setExpanded] = useState(() => new Set([initialWeek]));

  const weeks = useMemo(() => {
    const groups = new Map();
    for (const task of tasks) {
      const key = weekKeyOf(task.date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(task);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tasks]);

  const toggle = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <main className="px-6 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <Link href="/home" aria-label="Back" className="-ml-1 inline-flex p-1 text-ink transition-transform hover:-translate-x-0.5">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <button
          type="button"
          onClick={() => openCreate(todayKey())}
          aria-label="Add task"
          className="animate-pop-in group flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-transform active:scale-90"
        >
          <PlusIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
        </button>
      </div>
      <h1 className="animate-fade-up mt-4 text-lg font-semibold text-ink">All Tasks</h1>
      <p className="text-xs text-muted">Grouped by week, Monday to Sunday</p>

      <div className="mt-5 space-y-4">
        {loading &&
          [0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded bg-[#f1f1f5]" />)}
        {!loading && !weeks.length && <p className="py-12 text-center text-sm text-muted">You have no tasks yet</p>}
        {weeks.map(([key, weekTasks], i) => (
          <WeekCard key={key} index={i} weekKey={key} tasks={weekTasks} open={expanded.has(key)} onToggle={() => toggle(key)} />
        ))}
      </div>

      <Credit className="animate-fade-in mt-10 [animation-delay:400ms]" />
    </main>
  );
}

export default function WeeksPage() {
  return (
    <Suspense>
      <Weeks />
    </Suspense>
  );
}
