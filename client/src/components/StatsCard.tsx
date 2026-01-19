import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "primary" | "purple" | "emerald" | "amber";
}

const colorStyles = {
  primary: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500",
  purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-500",
  emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-500",
  amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-500",
};

export function StatsCard({ title, value, icon, trend, trendUp, className, color = "primary" }: StatsCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br backdrop-blur-sm",
      colorStyles[color],
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl bg-white/5", `text-${color}-500`)}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full border",
            trendUp 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white">{value}</h3>
      </div>
      
      {/* Decorative background glow */}
      <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20", `bg-${color}-500`)} />
    </div>
  );
}
