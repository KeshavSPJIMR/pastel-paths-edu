import { LucideIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel: string;
  onAction?: () => void;
  variant: "primary" | "secondary" | "accent";
}

const variantStyles = {
  primary: "bg-primary/10 border-primary/20 hover:border-primary/40",
  secondary: "bg-secondary/30 border-secondary/40 hover:border-secondary/60",
  accent: "bg-accent/30 border-accent/40 hover:border-accent/60",
};

const iconVariantStyles = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  variant 
}: QuickActionCardProps) {
  return (
    <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${variantStyles[variant]}`}>
      <div className={`h-11 w-11 rounded-xl ${iconVariantStyles[variant]} flex items-center justify-center mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button 
        variant="ghost" 
        className="p-0 h-auto font-semibold text-foreground hover:text-primary hover:bg-transparent group"
        onClick={onAction}
      >
        {actionLabel}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
