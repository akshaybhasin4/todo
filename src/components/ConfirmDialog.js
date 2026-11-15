"use client";

import { useEffect, useRef, useState } from "react";
import { TrashIcon } from "./Icons";

export default function ConfirmDialog({ task, onResult }) {
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef(null);

  const finish = (confirmed) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => onResult(confirmed), 180);
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && finishRef.current(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <button
        type="button"
        aria-label="Cancel"
        tabIndex={-1}
        onClick={() => finish(false)}
        className={`absolute inset-0 cursor-default bg-[#1b1b1f]/50 ${closing ? "animate-fade-out" : "animate-fade-in"}`}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        className={`relative w-full max-w-[320px] rounded-[6px] bg-white px-6 pb-6 pt-7 text-center shadow-2xl ${
          closing ? "animate-fade-out" : "animate-pop-in"
        }`}
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fde3e3] text-[#e5484d]">
          <TrashIcon className="animate-check-pop h-6 w-6 [animation-delay:120ms]" strokeWidth={1.8} />
        </span>
        <h2 id="confirm-title" className="mt-4 text-base font-semibold text-ink">
          Delete this task?
        </h2>
        <p id="confirm-text" className="mt-2 text-xs leading-5 text-[#6b6b73]">
          <span className="font-medium text-ink">“{task.title}”</span> will be permanently removed.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => finish(false)}
            className="h-11 border border-[#e3e3e8] text-sm font-medium text-ink transition active:scale-[0.97] hover:bg-[#f6f6f9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            className="h-11 bg-[#e5484d] text-sm font-medium text-white transition active:scale-[0.97] hover:bg-[#d93d42]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
