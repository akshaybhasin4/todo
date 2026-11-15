"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTasks } from "@/components/TasksProvider";
import TaskRow from "@/components/TaskRow";
import WeekStrip from "@/components/WeekStrip";
import StatCard from "@/components/StatCard";
import Credit from "@/components/Credit";
import { PlusIcon, RefreshIcon, SearchIcon } from "@/components/Icons";
import { formatShortDate, formatWeekRange, todayKey, weekKeyOf } from "@/lib/dates";

const stagger = (i) => ({ animationDelay: `${i * 60}ms` });

export default function Home() {
  const { tasks, loading, selectedDate, setSelectedDate, openCreate, refresh, refreshing } = useTasks();
  const weekKey = weekKeyOf(selectedDate);
  const isThisWeek = weekKey === weekKeyOf(todayKey());

  const { dayTasks, completed, pending, datesWithTasks } = useMemo(() => {
    const week = tasks.filter((t) => weekKeyOf(t.date) === weekKey);
    const completed = week.filter((t) => t.status === "completed").length;
    return {
      dayTasks: tasks.filter((t) => t.date === selectedDate),
      completed,
      pending: week.length - completed,
      datesWithTasks: new Set(week.map((t) => t.date)),
    };
  }, [tasks, weekKey, selectedDate]);

  const total = completed + pending;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const caption = isThisWeek ? "This Week" : formatWeekRange(weekKey);

  return (
    <main className="px-6 pb-32 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <div className="animate-fade-up flex gap-3" style={stagger(0)}>
        <Link
          href="/search"
          className="flex h-12 min-w-0 flex-1 items-center justify-between rounded-[4px] border border-[#e3e3e8] px-4 text-xs text-muted transition-colors hover:border-brand/50"
        >
          Search for a task
          <SearchIcon className="h-5 w-5 text-ink" />
        </Link>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing || loading}
          aria-label={refreshing ? "Refreshing tasks" : "Refresh tasks"}
          title="Refresh"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] border border-[#e3e3e8] text-ink transition-[border-color,color,transform] hover:border-brand/50 hover:text-brand active:scale-90 disabled:cursor-default"
        >
          <RefreshIcon className={`h-5 w-5 ${refreshing ? "animate-spin text-brand" : ""}`} />
        </button>
      </div>

      <div className="animate-fade-up mt-4" style={stagger(1)}>
        <WeekStrip selected={selectedDate} onSelect={setSelectedDate} datesWithTasks={datesWithTasks} />
      </div>

      <Link
        href={`/weeks?week=${weekKey}`}
        style={stagger(2)}
        className="animate-fade-up mt-6 grid grid-cols-2 gap-4"
        aria-label="View this week's tasks"
      >
        <StatCard variant="complete" title="Task Complete" count={completed} caption={caption} />
        <StatCard variant="pending" title="Task Pending" count={pending} caption={caption} />
      </Link>

      <section className="animate-fade-up mt-7" style={stagger(3)}>
        <h2 className="text-base font-semibold text-ink">Weekly Progress</h2>
        <div
          className="mt-3 h-[22px] overflow-hidden bg-brand-soft"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progress}% of this week's tasks completed`}
        >
          <div
            className="h-full bg-brand-dark transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="animate-fade-up mt-7" style={stagger(4)}>
        <div className="flex items-center justify-between">
          <h2 key={selectedDate} className="animate-fade-in text-base font-semibold text-ink">
            {selectedDate === todayKey() ? "Tasks Today" : `Tasks · ${formatShortDate(selectedDate)}`}
          </h2>
          <Link
            href={`/weeks?week=${weekKey}`}
            className="text-xs font-medium text-brand transition-opacity hover:opacity-75"
          >
            View All
          </Link>
        </div>

        <div key={selectedDate} className="mt-2">
          {loading ? (
            <div className="space-y-3 pt-2" aria-label="Loading tasks">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-[#f1f1f5]" />
              ))}
            </div>
          ) : dayTasks.length ? (
            dayTasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} />)
          ) : (
            <div className="animate-fade-up py-10 text-center">
              <p className="text-sm text-muted">No tasks for this day</p>
              <button
                type="button"
                onClick={() => openCreate(selectedDate)}
                className="mt-2 text-sm font-medium text-brand transition-opacity hover:opacity-75"
              >
                Add a task
              </button>
            </div>
          )}
        </div>
      </section>

      <Credit className="animate-fade-in mt-10 [animation-delay:500ms]" />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[430px] justify-center pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => openCreate(selectedDate)}
          aria-label="Add task"
          className="animate-pop-in group pointer-events-auto flex h-[68px] w-[68px] items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_24px_rgba(69,102,236,0.35)] transition-[transform,box-shadow] duration-200 [animation-delay:350ms] hover:shadow-[0_12px_30px_rgba(69,102,236,0.45)] active:scale-90"
        >
          <PlusIcon className="h-8 w-8 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.5} />
        </button>
      </div>
    </main>
  );
}
