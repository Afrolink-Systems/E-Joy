"use client";

import { motion } from "motion/react";
import {
  Brush,
  Camera,
  Grid2X2,
  List,
  Star,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

export type CollectionViewMode = "list" | "card" | "pack";

export interface AnimatedCollectionItem {
  id: string;
  title: string;
  subtitle?: string;
  idNumber?: string;
  image: string;
  icon?: React.ComponentType<{ className?: string }>;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  onOpen?: () => void;
}

interface CollectionItem {
  id: string;
  title: string;
  subtitle: string;
  idNumber: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "Cinematic Horizons",
    subtitle: "Photography",
    idNumber: "209",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&h=400&auto=format&fit=crop",
    icon: Camera,
  },
  {
    id: "2",
    title: "Abstract Dreams",
    subtitle: "Digital Art",
    idNumber: "808",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&h=400&auto=format&fit=crop",
    icon: Brush,
  },
];

export function CollectionViewTabs({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: CollectionViewMode;
  onChange: (value: CollectionViewMode) => void;
}) {
  return (
    <div className={cn("flex w-full min-w-0 rounded-[1.5rem] border border-border bg-card/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]", className)}>
      <Tab active={value === "list"} onClick={() => onChange("list")} icon={List} label="List view" />
      <Tab active={value === "card"} onClick={() => onChange("card")} icon={Grid2X2} label="Card view" />
    </div>
  );
}

export function AnimatedCollectionView({
  empty,
  items,
  view,
}: {
  empty?: React.ReactNode;
  items: AnimatedCollectionItem[];
  view: CollectionViewMode;
}) {
  if (!items.length) return <>{empty}</>;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
      className={cn(
        "relative w-full transition-all duration-300 ease-out",
        view === "list" && "flex flex-col gap-2.5 max-[370px]:gap-2",
        view === "card" && "grid grid-cols-2 gap-3",
        view === "pack" && "h-[420px] pt-10"
      )}
    >
      {items.map((item, index) => (
        <motion.article
          key={item.id}
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
          className={cn(
            "relative z-10 min-w-0 transition-all duration-300 ease-out",
            view === "list" &&
              "grid min-h-[104px] grid-cols-[92px_minmax(0,1fr)] gap-2.5 rounded-[1.2rem] border border-border bg-card/85 p-2 text-card-foreground shadow-[0_10px_24px_rgba(20,20,20,0.055)] min-[431px]:min-h-[112px] min-[431px]:grid-cols-[100px_minmax(0,1fr)] min-[431px]:gap-3 min-[431px]:rounded-[1.35rem] min-[431px]:p-2.5 max-[370px]:min-h-[96px] max-[370px]:grid-cols-[78px_minmax(0,1fr)]",
            view === "card" &&
              "overflow-hidden rounded-[1.45rem] border border-border bg-card/90 text-card-foreground shadow-[0_14px_34px_rgba(20,20,20,0.08)]",
            view === "pack" &&
              "absolute left-1/2 top-10 h-[300px] w-[76%] max-w-[310px] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_60px_rgba(20,20,20,0.16)]"
          )}
          style={view === "pack" ? packStyle(index, items.length) : undefined}
        >
          <motion.button
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
            type="button"
            onClick={item.onOpen}
            className={cn(
              "block overflow-hidden bg-muted text-left transition-all duration-300 ease-out",
              view === "list" && "size-[84px] rounded-[0.95rem] min-[431px]:size-[94px] min-[431px]:rounded-[1.05rem] max-[370px]:size-[72px]",
              view === "card" && "h-[112px] w-full",
              view === "pack" && "h-full w-full"
            )}
            aria-label={`View ${item.title}`}
          >
            <motion.img
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
              src={item.image}
              alt=""
              className="block size-full object-cover"
            />
          </motion.button>

          {view !== "pack" && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
              transition={{ duration: 0.12, ease: "linear" }}
              className={cn(
                "min-w-0 transition-all duration-200 ease-out",
                view === "list" && "flex flex-col py-0.5 pr-9 max-[370px]:pr-8",
                view === "card" && "p-3 pt-2"
              )}
            >
              <div className={cn("min-w-0", view === "card" && "pr-8")}>
                <h3 className="truncate text-[16px] font-black leading-tight text-card-foreground max-[370px]:text-[15px]">
                  {item.title}
                </h3>
                {item.subtitle ? (
                  <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground max-[370px]:text-[11px]">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
              <div className={cn("mt-1.5", view === "list" && "mt-auto")}>{item.meta}</div>
            </motion.div>
          )}

          {view !== "pack" ? item.action : null}
        </motion.article>
      ))}
    </motion.div>
  );
}

export default function LayoutSwitcher() {
  const [view, setView] = useState<CollectionViewMode>("list");
  const items = ITEMS.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    idNumber: item.idNumber,
    image: item.image,
    icon: item.icon,
    meta: (
      <div className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
        <Star className="size-2.5" />
        <span>#{item.idNumber}</span>
      </div>
    ),
  }));

  return (
    <div className="mx-auto w-full max-w-xl p-4 font-sans selection:bg-primary/10 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-medium text-foreground">My Collection</h2>
          <CollectionViewTabs value={view} onChange={setView} />
        </div>
        <div className="h-px w-full bg-border" />
        <div className="relative min-h-[350px]">
          <AnimatedCollectionView items={items} view={view} empty={null} />
          {view === "pack" && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 5, filter: "blur(5px)" }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative z-0 mt-16 px-4 text-center"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                <Ticket className="size-3" />
                <span>Bundle unlocked</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-semibold uppercase transition-colors outline-none min-[431px]:h-10 min-[431px]:gap-2 min-[431px]:px-3 max-[370px]:text-[11px]",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active ? (
        <motion.span
          layoutId="active-tab"
          className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
          transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap min-[431px]:gap-2">
        {React.createElement(icon, { className: cn("size-4 transition-transform duration-300", active && "scale-110") })}
        <span className="hidden min-[431px]:inline">{label}</span>
        <span className="min-[431px]:hidden">{label.replace(" view", "")}</span>
      </span>
    </button>
  );
}

function packStyle(index: number, total: number): React.CSSProperties {
  const x = index === 0 ? -38 : index === 1 ? 22 : 52;
  return {
    zIndex: total - index,
    transform: `translateX(calc(-50% + ${x}px)) translateY(${index * 18}px) rotate(${(index - 1) * 7}deg) scale(${index > 2 ? 0.9 : 1})`,
  };
}
