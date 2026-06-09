"use client";

import { Search, X } from "lucide-react";

export type DiscoverTabId = "search";

export default function DiscoverButton({
  className,
  onSearchChange,
  placeholder = "Search",
  search = "",
}: {
  activeTab?: DiscoverTabId;
  className?: string;
  onSearchChange?: (value: string) => void;
  onTabChange?: (value: DiscoverTabId) => void;
  placeholder?: string;
  search?: string;
}) {
  return (
    <label className={`flex h-[52px] min-w-0 items-center gap-3 rounded-[3rem] bg-card px-4 text-card-foreground shadow-[0_10px_22px_rgba(0,0,0,0.08)] min-[431px]:h-[58px] min-[431px]:px-5 max-[370px]:h-12 max-[370px]:px-3.5 ${className ?? ""}`}>
      <Search className="size-5 shrink-0 text-muted-foreground min-[431px]:size-6" />
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange?.(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-card-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 max-[370px]:text-sm"
      />
      {search ? (
        <button
          type="button"
          onClick={() => onSearchChange?.("")}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </label>
  );
}
