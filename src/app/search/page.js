"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTasks } from "@/components/TasksProvider";
import TaskRow from "@/components/TaskRow";
import { ArrowLeftIcon, SearchIcon } from "@/components/Icons";
import { matchesQuery } from "@/lib/tasks";

export default function Search() {
  const { tasks, loading } = useTasks();
  const [query, setQuery] = useState("");
  const results = useMemo(() => tasks.filter((t) => matchesQuery(t, query)), [tasks, query]);

  return (
    <main className="px-6 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Link href="/home" aria-label="Back" className="-ml-1 inline-flex p-1 text-ink transition-transform hover:-translate-x-0.5">
        <ArrowLeftIcon className="h-6 w-6" />
      </Link>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="animate-fade-up mt-5">
        <label className="flex h-12 items-center gap-3 rounded-[4px] border border-[#e3e3e8] px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(69,102,236,0.12)]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a task"
            aria-label="Search tasks"
            autoFocus
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-xs placeholder:text-muted sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          <SearchIcon className="h-5 w-5 shrink-0 text-ink" />
        </label>
      </form>

      <div className="mt-6">
        {!loading && query.trim() && (
          <p key={results.length} className="animate-fade-in mb-1 text-[11px] text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}
        {results.map((task, i) => (
          <TaskRow key={task.id} task={task} index={i} showActions={false} showDate query={query} />
        ))}
        {!loading && !results.length && (
          <p className="animate-fade-up py-12 text-center text-sm text-muted">
            {query.trim() ? `No tasks match “${query.trim()}”` : "You have no tasks yet"}
          </p>
        )}
      </div>
    </main>
  );
}
