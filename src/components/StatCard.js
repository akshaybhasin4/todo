import { CheckIcon, CloseIcon } from "./Icons";
import AnimatedNumber from "./AnimatedNumber";

const variants = {
  complete: {
    card: "bg-[#eef1fd]",
    box: "border-brand bg-[#a9b8f4] text-brand-dark",
    Icon: CheckIcon,
  },
  pending: {
    card: "bg-[#fde3e3]",
    box: "border-[#e5484d] bg-[#f6a9a9] text-[#d92d33]",
    Icon: CloseIcon,
  },
};

export default function StatCard({ variant, title, count, caption }) {
  const { card, box, Icon } = variants[variant];
  return (
    <div
      className={`flex h-full flex-col rounded-[2px] px-3 py-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${card}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          key={count}
          className={`animate-pop flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[2px] border-[1.5px] ${box}`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="text-xs text-ink">{title}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2 pl-8">
        <span className="text-xl font-semibold leading-none text-ink tabular-nums">
          <AnimatedNumber value={count} />
        </span>
        <span className="text-[9px] text-muted">{caption}</span>
      </div>
    </div>
  );
}
