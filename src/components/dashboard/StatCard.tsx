import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accentColor?: "indigo" | "emerald" | "amber" | "slate";
}

const ACCENT: Record<NonNullable<Props["accentColor"]>, string> = {
  indigo: "bg-accent text-accent-foreground ring-primary/10",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-600 ring-amber-600/10",
  slate: "bg-muted text-muted-foreground ring-border",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accentColor = "slate",
}: Props) {
  return (
    <div className="group rounded-xl border border-border/70 bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform duration-200 group-hover:scale-105",
            ACCENT[accentColor],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground/80">{description}</p>
      )}
    </div>
  );
}
