"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Credit from "@/components/Credit";

const ONBOARDED = "todo:onboarded";

function Zigzags({ className }) {
  return (
    <svg viewBox="0 0 92 62" fill="none" className={className} aria-hidden>
      {[0, 12, 24, 36, 48].map((y) => (
        <path
          key={y}
          d={`M2 ${y + 12} L11 ${y + 3} L20 ${y + 12} L29 ${y + 3} L38 ${y + 12} L47 ${y + 3} L56 ${y + 12} L65 ${y + 3} L74 ${y + 12} L83 ${y + 3} L90 ${y + 10}`}
          stroke="currentColor"
          strokeWidth="2.6"
        />
      ))}
    </svg>
  );
}

export default function Onboarding() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDED)) router.replace("/home");
    } catch {}
  }, [router]);

  const start = () => {
    try {
      localStorage.setItem(ONBOARDED, "1");
    } catch {}
    router.push("/home");
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="relative flex-[1.9] overflow-hidden bg-brand">
        <div className="animate-drift absolute -right-10 -top-10 h-24 w-24 rounded-full border-[14px] border-[#6f89f2]" />
        <div className="absolute left-0 top-[18%] w-24 animate-[fade-in_0.6s_ease-out_0.2s_both]">
          <Zigzags className="animate-float w-24 text-[#6f89f2]" />
        </div>
        <div className="absolute bottom-[8%] right-0 w-24 animate-[fade-in_0.6s_ease-out_0.35s_both]">
          <Zigzags className="animate-float w-24 text-[#6f89f2] [animation-delay:-3s]" />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7">
        <h1 className="animate-fade-up text-[22px] font-semibold text-ink [animation-delay:150ms]">Manage What To Do</h1>
        <p className="animate-fade-up mt-4 max-w-[260px] text-xs leading-5 text-[#6b6b73] [animation-delay:250ms]">
          The best way to manage what you have to do, don&apos;t forget your plans
        </p>
        <div className="animate-fade-up mt-auto pt-8 [animation-delay:350ms]">
          <button
            type="button"
            onClick={start}
            className="h-12 w-full bg-brand text-sm font-medium text-white transition-[opacity,transform] hover:opacity-95 active:scale-[0.98]"
          >
            Get Started
          </button>
          <Credit className="mt-4" />
        </div>
      </div>
    </main>
  );
}
