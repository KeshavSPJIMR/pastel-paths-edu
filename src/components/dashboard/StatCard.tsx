import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: "coral" | "mint" | "lavender" | "sky" | "sunny";
}

const gradientClasses = {
  coral: "gradient-coral",
  mint: "gradient-mint",
  lavender: "gradient-lavender",
  sky: "gradient-sky",
  sunny: "gradient-sunny",
};

export function StatCard({ title, value, subtitle, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-hover transition-all duration-300 border border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl ${gradientClasses[gradient]} flex items-center justify-center shadow-soft`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
