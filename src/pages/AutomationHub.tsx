import { useState } from "react";
import { 
  FileText, 
  MessageSquare, 
  ClipboardCheck, 
  BarChart3,
  Brain,
  Mail,
  Calendar,
  BookOpen
} from "lucide-react";
import { AutomationCard } from "@/components/automation/AutomationCard";

interface Automation {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  isActive: boolean;
  timeSaved: string;
}

const initialAutomations: Automation[] = [
  {
    id: "lesson-plans",
    title: "Lesson Plan Generator",
    description: "AI creates curriculum-aligned lesson plans based on your teaching goals",
    icon: FileText,
    isActive: true,
    timeSaved: "3 hrs/week"
  },
  {
    id: "parent-updates",
    title: "Parent Communication",
    description: "Automated progress updates sent to parents weekly",
    icon: MessageSquare,
    isActive: true,
    timeSaved: "2 hrs/week"
  },
  {
    id: "grading",
    title: "Smart Grading Assistant",
    description: "AI-powered grading with personalized feedback suggestions",
    icon: ClipboardCheck,
    isActive: false,
    timeSaved: "4 hrs/week"
  },
  {
    id: "progress-reports",
    title: "Progress Reports",
    description: "Automatically generate detailed student progress reports",
    icon: BarChart3,
    isActive: true,
    timeSaved: "2 hrs/week"
  },
  {
    id: "differentiation",
    title: "Learning Differentiation",
    description: "Adapt materials to different learning levels automatically",
    icon: Brain,
    isActive: false,
    timeSaved: "3 hrs/week"
  },
  {
    id: "emails",
    title: "Email Responses",
    description: "Draft responses to common parent and admin emails",
    icon: Mail,
    isActive: true,
    timeSaved: "1.5 hrs/week"
  },
  {
    id: "scheduling",
    title: "Schedule Optimizer",
    description: "Optimize class schedules for maximum learning time",
    icon: Calendar,
    isActive: false,
    timeSaved: "1 hr/week"
  },
  {
    id: "resources",
    title: "Resource Finder",
    description: "Find relevant teaching resources and activities automatically",
    icon: BookOpen,
    isActive: true,
    timeSaved: "2 hrs/week"
  },
];

export default function AutomationHub() {
  const [automations, setAutomations] = useState(initialAutomations);

  const handleToggle = (id: string, active: boolean) => {
    setAutomations(prev => 
      prev.map(a => a.id === id ? { ...a, isActive: active } : a)
    );
  };

  const activeCount = automations.filter(a => a.isActive).length;
  const totalTimeSaved = automations
    .filter(a => a.isActive)
    .reduce((acc, a) => {
      const hours = parseFloat(a.timeSaved);
      return acc + hours;
    }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Automation Hub ✨</h1>
        <p className="text-muted-foreground mt-1">
          Automate repetitive tasks and focus on what matters - teaching!
        </p>
      </div>

      {/* Stats Banner */}
      <div className="gradient-lavender rounded-2xl p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-accent-foreground">Time Saved This Week</h2>
            <p className="text-accent-foreground/80">
              {activeCount} automations active, saving you valuable time
            </p>
          </div>
          <div className="text-4xl font-bold text-accent-foreground">
            {totalTimeSaved} hrs
          </div>
        </div>
      </div>

      {/* Automation Grid */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">Available Automations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              title={automation.title}
              description={automation.description}
              icon={automation.icon}
              isActive={automation.isActive}
              timeSaved={automation.timeSaved}
              onToggle={(active) => handleToggle(automation.id, active)}
            />
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-info/20 border-2 border-info/30 rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-2">💡 Pro Tip</h3>
        <p className="text-muted-foreground">
          Start with 2-3 automations and gradually add more as you get comfortable. 
          The Lesson Plan Generator and Parent Communication automations are most popular 
          among teachers!
        </p>
      </div>
    </div>
  );
}
