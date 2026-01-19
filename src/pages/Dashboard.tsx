import { 
  Users, 
  Trophy,
  MessageSquare,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { PerformanceHeatmap } from "@/components/dashboard/PerformanceHeatmap";
import { CreateStudentDialog } from "@/components/students/CreateStudentDialog";
import { CurriculumUploadDialog } from "@/components/curriculum/CurriculumUploadDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good morning, Ms. Johnson! 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your classroom today.</p>
        </div>
        <div className="flex items-center gap-2">
          <CurriculumUploadDialog />
          <CreateStudentDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Students"
          value={24}
          subtitle="3 new this week"
          icon={Users}
          gradient="coral"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Generate Quiz"
            description="Create quizzes from NCERT Class 5 Science curriculum"
            icon={ClipboardList}
            actionLabel="Generate Quiz"
            variant="accent"
            onAction={() => navigate("/quiz-generator")}
          />
          <QuickActionCard
            title="Send Updates"
            description="Notify parents about student progress"
            icon={MessageSquare}
            actionLabel="Compose Message"
            variant="secondary"
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

    </div>
  );
}
