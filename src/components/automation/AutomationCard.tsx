import { LucideIcon, Zap, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface AutomationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isActive: boolean;
  timeSaved: string;
  onToggle?: (active: boolean) => void;
}

export function AutomationCard({ 
  title, 
  description, 
  icon: Icon, 
  isActive, 
  timeSaved,
  onToggle 
}: AutomationCardProps) {
  return (
    <div className={`
      rounded-2xl p-5 border-2 transition-all duration-300
      ${isActive 
        ? 'bg-accent/20 border-accent/40 shadow-soft' 
        : 'bg-card border-border/50 hover:border-border'
      }
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className={`
          h-12 w-12 rounded-xl flex items-center justify-center
          ${isActive ? 'gradient-lavender' : 'bg-muted'}
        `}>
          <Icon className={`h-6 w-6 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        </div>
        <Switch 
          checked={isActive} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-accent"
        />
      </div>
      
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex items-center gap-4">
        <Badge 
          variant="secondary" 
          className={`
            rounded-lg px-3 py-1
            ${isActive ? 'bg-success/20 text-success-foreground' : 'bg-muted text-muted-foreground'}
          `}
        >
          <Zap className="h-3 w-3 mr-1" />
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Saves {timeSaved}</span>
        </div>
      </div>
    </div>
  );
}
