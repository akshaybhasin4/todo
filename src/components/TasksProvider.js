"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { sortTasks } from "@/lib/tasks";
import { todayKey } from "@/lib/dates";
import ConfirmDialog from "./ConfirmDialog";

const TasksContext = createContext(null);

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong");
  return body;
}

const editableFields = ({ title, description, date, startTime, endTime, priority, status }) => ({
  title,
  description,
  date,
  startTime,
  endTime,
  priority,
  status,
});

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [sheet, setSheet] = useState(null); // { mode: "create", date } | { mode: "edit", task }
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null); // { task, resolve }
  const toastTimer = useRef();

  // Opens the in-app delete confirmation; resolves true when the user confirms.
  const confirmDelete = useCallback((task) => new Promise((resolve) => setConfirm({ task, resolve })), []);

  const showToast = useCallback((message, action) => {
    clearTimeout(toastTimer.current);
    setToast({ message, action, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const { tasks } = await api(`/api/tasks?today=${todayKey()}`);
      setTasks(tasks);
    } catch (err) {
      showToast(err.message, { label: "Retry", run: load });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // Manual refresh from the server. Spins for at least 600ms so the tap feels acknowledged.
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [{ tasks }] = await Promise.all([
        api(`/api/tasks?today=${todayKey()}`),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      setTasks(tasks);
      showToast("Tasks updated");
    } catch (err) {
      showToast(err.message, { label: "Retry", run: () => refresh() });
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

  const createTask = useCallback(async (data) => {
    const { task } = await api("/api/tasks", { method: "POST", body: JSON.stringify(data) });
    setTasks((ts) => sortTasks([...ts, task]));
    return task;
  }, []);

  const updateTask = useCallback(async (id, patch) => {
    const { task } = await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setTasks((ts) => sortTasks(ts.map((t) => (t.id === id ? task : t))));
    return task;
  }, []);

  const toggleTask = useCallback(
    async (task) => {
      const status = task.status === "completed" ? "in_progress" : "completed";
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
      try {
        await api(`/api/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      } catch (err) {
        setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
        showToast(err.message);
      }
    },
    [showToast]
  );

  const removeTask = useCallback(
    async (task) => {
      setTasks((ts) => ts.filter((t) => t.id !== task.id));
      try {
        await api(`/api/tasks/${task.id}`, { method: "DELETE" });
        showToast("Task deleted", {
          label: "Undo",
          run: () => createTask(editableFields(task)).catch((err) => showToast(err.message)),
        });
      } catch (err) {
        setTasks((ts) => sortTasks([...ts, task]));
        showToast(err.message);
      }
    },
    [createTask, showToast]
  );

  const value = useMemo(
    () => ({
      tasks,
      loading,
      selectedDate,
      setSelectedDate,
      sheet,
      openCreate: (date) => setSheet({ mode: "create", date }),
      openEdit: (task) => setSheet({ mode: "edit", task }),
      closeSheet: () => setSheet(null),
      createTask,
      updateTask,
      toggleTask,
      removeTask,
      confirmDelete,
      refresh,
      refreshing,
    }),
    [tasks, loading, selectedDate, sheet, createTask, updateTask, toggleTask, removeTask, confirmDelete, refresh, refreshing]
  );

  return (
    <TasksContext.Provider value={value}>
      {children}
      {confirm && (
        <ConfirmDialog
          task={confirm.task}
          onResult={(ok) => {
            confirm.resolve(ok);
            setConfirm(null);
          }}
        />
      )}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-toast-in fixed bottom-28 left-1/2 z-50 flex w-[calc(100%-48px)] max-w-[382px] -translate-x-1/2 items-center justify-between gap-4 rounded-md bg-ink px-4 py-3 text-sm text-white shadow-lg"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                setToast(null);
                toast.action.run();
              }}
              className="font-semibold text-brand-soft"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used inside <TasksProvider>");
  return ctx;
}
