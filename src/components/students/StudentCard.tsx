import { Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StudentCardProps {
  name: string;
  avatar: string;
  grade: string;
  progress: number;
  trend: "up" | "down" | "stable";
  stars: number;
}

export function StudentCard({ name, avatar, grade, progress, trend, stars }: StudentCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-hover transition-all duration-300 border border-border/50 group">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground truncate">{name}</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{grade}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Weekly Progress</span>
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-muted" />
      </div>
    </div>
  );
}
