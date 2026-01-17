import { useState } from "react";
import { AlertTriangle, TrendingUp, Eye, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface StudentPerformance {
  id: string;
  name: string;
  avatar: string;
  subjects: {
    math: number;
    reading: number;
    science: number;
  };
}

const students: StudentPerformance[] = [
  { id: "1", name: "Emma W.", avatar: "🧒", subjects: { math: 92, reading: 88, science: 95 } },
  { id: "2", name: "Liam C.", avatar: "👦", subjects: { math: 78, reading: 85, science: 72 } },
  { id: "3", name: "Olivia M.", avatar: "👧", subjects: { math: 65, reading: 91, science: 58 } },
  { id: "4", name: "Noah J.", avatar: "🧒", subjects: { math: 45, reading: 52, science: 68 } },
  { id: "5", name: "Ava T.", avatar: "👧", subjects: { math: 88, reading: 94, science: 82 } },
  { id: "6", name: "Lucas D.", avatar: "👦", subjects: { math: 55, reading: 48, science: 62 } },
  { id: "7", name: "Sophia B.", avatar: "👧", subjects: { math: 96, reading: 98, science: 94 } },
  { id: "8", name: "Mason G.", avatar: "🧒", subjects: { math: 72, reading: 68, science: 75 } },
];

const subjects = [
  { key: "math" as const, label: "Math", icon: "➗" },
  { key: "reading" as const, label: "Reading", icon: "📖" },
  { key: "science" as const, label: "Science", icon: "🔬" },
];

function getScoreColor(score: number): string {
  if (score >= 85) return "bg-success/80 text-success-foreground";
  if (score >= 70) return "bg-warning/80 text-warning-foreground";
  if (score >= 55) return "bg-primary/60 text-primary-foreground";
  return "bg-destructive/80 text-destructive-foreground";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excelling";
  if (score >= 70) return "On Track";
  if (score >= 55) return "Needs Support";
  return "Intervention Needed";
}

function getOverallStatus(subjects: StudentPerformance["subjects"]) {
  const avg = (subjects.math + subjects.reading + subjects.science) / 3;
  const gaps = Object.values(subjects).filter(s => s < 60).length;
  
  if (gaps >= 2) return { status: "critical", label: "Multiple Gaps", color: "bg-destructive text-destructive-foreground" };
  if (gaps === 1) return { status: "warning", label: "1 Gap Found", color: "bg-warning text-warning-foreground" };
  if (avg >= 85) return { status: "excellent", label: "Excelling", color: "bg-success text-success-foreground" };
  return { status: "good", label: "On Track", color: "bg-info text-info-foreground" };
}

interface BirdEyeViewProps {
  student: StudentPerformance | null;
  open: boolean;
  onClose: () => void;
}

function BirdEyeView({ student, open, onClose }: BirdEyeViewProps) {
  if (!student) return null;

  const overall = getOverallStatus(student.subjects);
  const avg = Math.round((student.subjects.math + student.subjects.reading + student.subjects.science) / 3);
  const strengths = subjects.filter(s => student.subjects[s.key] >= 85);
  const gaps = subjects.filter(s => student.subjects[s.key] < 60);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-3xl">{student.avatar}</span>
            <div>
              <div className="text-xl font-bold">{student.name}</div>
              <div className="text-sm font-normal text-muted-foreground">Bird's Eye View</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Overall Score */}
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-4xl font-bold text-foreground mb-1">{avg}%</div>
            <Badge className={`${overall.color} rounded-full`}>
              {overall.label}
            </Badge>
          </div>

          {/* Subject Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Subject Performance</h4>
            {subjects.map((subject) => {
              const score = student.subjects[subject.key];
              return (
                <div key={subject.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{subject.icon}</span>
                      <span className="font-medium">{subject.label}</span>
                    </span>
                    <span className={`font-bold ${score < 60 ? 'text-destructive' : 'text-foreground'}`}>
                      {score}%
                    </span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-3">
            {strengths.length > 0 && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success-foreground font-semibold text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Strengths
                </div>
                <div className="text-xs text-muted-foreground">
                  {strengths.map(s => s.label).join(", ")}
                </div>
              </div>
            )}
            {gaps.length > 0 && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Learning Gaps
                </div>
                <div className="text-xs text-muted-foreground">
                  {gaps.map(s => s.label).join(", ")}
                </div>
              </div>
            )}
          </div>

          {/* Recommendation */}
          {gaps.length > 0 && (
            <div className="p-4 rounded-xl gradient-lavender">
              <h4 className="font-semibold text-accent-foreground mb-1">💡 Recommended Intervention</h4>
              <p className="text-sm text-accent-foreground/80">
                Schedule focused {gaps[0].label.toLowerCase()} sessions with small group activities. 
                Consider peer tutoring with high-performing students.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PerformanceHeatmap() {
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);

  const gapsCount = students.filter(s => 
    s.subjects.math < 60 || s.subjects.reading < 60 || s.subjects.science < 60
  ).length;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cross-Subject Performance Heatmap</h2>
          <p className="text-sm text-muted-foreground">Click any student row for Bird's Eye View</p>
        </div>
        {gapsCount > 0 && (
          <Badge variant="destructive" className="rounded-full px-3 py-1 self-start">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {gapsCount} student{gapsCount > 1 ? 's' : ''} need intervention
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-success/80" />
          <span className="text-xs text-muted-foreground">85%+ Excelling</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-warning/80" />
          <span className="text-xs text-muted-foreground">70-84% On Track</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-primary/60" />
          <span className="text-xs text-muted-foreground">55-69% Needs Support</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-destructive/80" />
          <span className="text-xs text-muted-foreground">&lt;55% Intervention</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground w-40">Student</th>
              {subjects.map((subject) => (
                <th key={subject.key} className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">
                  <span className="flex items-center justify-center gap-1">
                    <span>{subject.icon}</span>
                    <span>{subject.label}</span>
                  </span>
                </th>
              ))}
              <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-muted-foreground w-16">View</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const overall = getOverallStatus(student.subjects);
              return (
                <tr 
                  key={student.id} 
                  className="border-t border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{student.avatar}</span>
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                  </td>
                  {subjects.map((subject) => {
                    const score = student.subjects[subject.key];
                    return (
                      <td key={subject.key} className="py-3 px-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`
                                mx-auto h-10 w-16 rounded-lg flex items-center justify-center
                                font-bold text-sm transition-transform hover:scale-105
                                ${getScoreColor(score)}
                              `}
                            >
                              {score}%
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{subject.label}: {getScoreLabel(score)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                  <td className="py-3 px-2 text-center">
                    <Badge className={`${overall.color} rounded-full text-xs`}>
                      {overall.label}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button 
                      className="h-8 w-8 rounded-lg bg-accent/30 hover:bg-accent/50 flex items-center justify-center mx-auto transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                      }}
                    >
                      <Eye className="h-4 w-4 text-accent-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bird's Eye View Modal */}
      <BirdEyeView 
        student={selectedStudent} 
        open={!!selectedStudent} 
        onClose={() => setSelectedStudent(null)} 
      />
    </div>
  );
}
