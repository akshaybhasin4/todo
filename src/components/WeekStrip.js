"use client";

import { useRef, useState } from "react";
import { shiftKey, toKey, todayKey, weekDays, weekKeyOf } from "@/lib/dates";

// Mon → Sun day picker. Swipe (or drag) sideways to move between weeks;
// the new week slides in from the direction you moved.
export default function WeekStrip({ selected, onSelect, datesWithTasks }) {
  const start = useRef(null);
  const swiped = useRef(false);
  const today = todayKey();
  const weekKey = weekKeyOf(selected);

  const [shown, setShown] = useState({ week: weekKey, dir: null });
  if (shown.week !== weekKey) setShown({ week: weekKey, dir: weekKey > shown.week ? "next" : "prev" });
  const slide = shown.dir === "next" ? "animate-week-next" : shown.dir === "prev" ? "animate-week-prev" : "";

  return (
    <div
      className="touch-pan-y select-none overflow-hidden"
      onPointerDown={(e) => {
        start.current = e.clientX;
        swiped.current = false;
      }}
      onPointerUp={(e) => {
        if (start.current === null) return;
        const dx = e.clientX - start.current;
        start.current = null;
        if (Math.abs(dx) > 40) {
          swiped.current = true;
          onSelect(shiftKey(selected, dx < 0 ? 7 : -7));
        }
      }}
      onClickCapture={(e) => {
        if (swiped.current) {
          swiped.current = false;
          e.stopPropagation();
        }
      }}
    >
      <div key={weekKey} className={`grid grid-cols-7 ${slide}`}>
        {weekDays(selected).map((day) => {
          const key = toKey(day);
          const active = key === selected;
          const hasTasks = datesWithTasks.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={active}
              aria-label={day.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
              className={`mx-auto flex w-[38px] flex-col items-center rounded-[2px] pb-1.5 pt-2 transition-[background-color,color,transform] duration-200 ${
                active ? "animate-pop bg-brand text-white shadow-[0_6px_14px_rgba(69,102,236,0.3)]" : key === today ? "text-brand hover:bg-[#eef1fd]" : "text-muted hover:bg-[#f4f4f8]"
              }`}
            >
              <span className="text-[10px] leading-none">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
              <span className="mt-1.5 text-[13px] leading-none">{String(day.getDate()).padStart(2, "0")}</span>
              <span
                className={`mt-1.5 h-1 w-1 rounded-full transition-[background-color,transform] duration-300 ${
                  hasTasks ? (active ? "scale-100 bg-white" : "scale-100 bg-brand/50") : "scale-0 bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
