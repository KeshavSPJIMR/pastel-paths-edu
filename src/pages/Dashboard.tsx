import { 
  Users, 
  BookOpen, 
  Clock, 
  Trophy,
  FileText,
  MessageSquare,
  Calendar,
  Sparkles
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { PerformanceHeatmap } from "@/components/dashboard/PerformanceHeatmap";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good morning, Ms. Johnson! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your classroom today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={24}
          subtitle="3 new this week"
          icon={Users}
          gradient="coral"
        />
        <StatCard
          title="Lessons This Week"
          value={12}
          subtitle="4 completed"
          icon={BookOpen}
          gradient="mint"
        />
        <StatCard
          title="Hours Saved"
          value="8.5"
          subtitle="Via AI automation"
          icon={Clock}
          gradient="lavender"
        />
        <StatCard
          title="Class Average"
          value="87%"
          subtitle="+5% from last week"
          icon={Trophy}
          gradient="sunny"
        />
      </div>

      {/* Performance Heatmap */}
      <PerformanceHeatmap />

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Create Lesson Plan"
            description="AI-assisted lesson planning with curriculum alignment"
            icon={FileText}
            actionLabel="Start Creating"
            variant="primary"
          />
          <QuickActionCard
            title="Send Updates"
            description="Notify parents about student progress"
            icon={MessageSquare}
            actionLabel="Compose Message"
            variant="secondary"
          />
          <QuickActionCard
            title="Schedule Event"
            description="Plan classroom activities and events"
            icon={Calendar}
            actionLabel="Add Event"
            variant="accent"
          />
          <QuickActionCard
            title="AI Assistant"
            description="Get help with any teaching task"
            icon={Sparkles}
            actionLabel="Ask AI"
            variant="primary"
          />
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {[
            { time: "8:30 AM", activity: "Morning Circle", status: "completed" },
            { time: "9:00 AM", activity: "Math - Addition & Subtraction", status: "current" },
            { time: "10:30 AM", activity: "Reading Time", status: "upcoming" },
            { time: "11:30 AM", activity: "Art & Crafts", status: "upcoming" },
            { time: "1:00 PM", activity: "Science - Plants & Seeds", status: "upcoming" },
          ].map((item, index) => (
            <div 
              key={index} 
              className={`
                flex items-center gap-4 p-3 rounded-xl transition-colors
                ${item.status === 'current' ? 'bg-primary/10 border border-primary/20' : 
                  item.status === 'completed' ? 'bg-muted/50' : 'hover:bg-muted/50'}
              `}
            >
              <div className={`
                h-10 w-20 rounded-lg flex items-center justify-center text-sm font-bold
                ${item.status === 'current' ? 'gradient-coral text-primary-foreground' : 
                  item.status === 'completed' ? 'bg-success/20 text-success-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                {item.time}
              </div>
              <span className={`font-medium ${item.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {item.activity}
              </span>
              {item.status === 'current' && (
                <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  In Progress
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
