import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent" | "success";
}

const variantStyles = {
  default: "bg-card border border-border text-card-foreground shadow-sm",
  primary:
    "bg-primary text-primary-foreground shadow-md shadow-primary/20 dark:bg-indigo-600 dark:border dark:border-white/10 dark:text-white",
  accent:
    "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/20",
  success:
    "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1",
        variantStyles[variant],
      )}
    >
      {/* Subtle Background Pattern for non-default variants */}
      {variant !== "default" && (
        <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      )}

      <div className="flex items-start justify-between">
        <div className="space-y-4">
          {/* Icon Container */}
          <div
            className={cn(
              "inline-flex p-2.5 rounded-xl",
              variant === "default"
                ? "bg-primary/10 text-primary"
                : "bg-white/20 text-white",
            )}
          >
            <Icon size={20} strokeWidth={2.5} />
          </div>

          <div className="space-y-1">
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider opacity-80",
                variant === "default"
                  ? "text-muted-foreground"
                  : "text-white/90",
              )}
            >
              {title}
            </p>
            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
            {subtitle && (
              <p
                className={cn(
                  "text-xs mt-1 opacity-70",
                  variant === "default"
                    ? "text-muted-foreground"
                    : "text-white/80",
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
              variant === "default"
                ? trend.isPositive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                : "bg-white/20 text-white",
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
