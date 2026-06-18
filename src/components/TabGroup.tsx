"use client";

import type { LucideIcon } from "lucide-react";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type TabGroupProps<T extends string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

export function TabGroup<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: TabGroupProps<T>) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );

  return (
    <div
      className={`li-tab-group ${className}`}
      role="tablist"
      style={{ "--tab-count": tabs.length, "--tab-active": activeIndex } as React.CSSProperties}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className="li-tab"
            data-active={active ? "true" : "false"}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
      <span className="li-tab-indicator" aria-hidden />
    </div>
  );
}
