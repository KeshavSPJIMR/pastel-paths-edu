import { Search, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentCard } from "@/components/students/StudentCard";
import { Progress } from "@/components/ui/progress";

const students = [
  { name: "Emma Wilson", avatar: "🧒", grade: "Grade 2", progress: 92, trend: "up" as const, stars: 5 },
  { name: "Liam Chen", avatar: "👦", grade: "Grade 2", progress: 85, trend: "up" as const, stars: 4 },
  { name: "Olivia Martinez", avatar: "👧", grade: "Grade 2", progress: 78, trend: "stable" as const, stars: 4 },
  { name: "Noah Johnson", avatar: "🧒", grade: "Grade 2", progress: 71, trend: "down" as const, stars: 3 },
  { name: "Ava Thompson", avatar: "👧", grade: "Grade 2", progress: 88, trend: "up" as const, stars: 5 },
  { name: "Lucas Davis", avatar: "👦", grade: "Grade 2", progress: 65, trend: "stable" as const, stars: 3 },
  { name: "Sophia Brown", avatar: "👧", grade: "Grade 2", progress: 95, trend: "up" as const, stars: 5 },
  { name: "Mason Garcia", avatar: "🧒", grade: "Grade 2", progress: 72, trend: "up" as const, stars: 4 },
];

const subjectProgress = [
  { subject: "Mathematics", progress: 82, color: "bg-primary" },
  { subject: "Reading", progress: 88, color: "bg-secondary" },
  { subject: "Science", progress: 75, color: "bg-accent" },
  { subject: "Art", progress: 95, color: "bg-warning" },
];

export default function StudentProgress() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Progress</h1>
          <p className="text-muted-foreground mt-1">Track and monitor student learning outcomes</p>
        </div>
        <Button className="gradient-coral text-primary-foreground rounded-xl shadow-soft">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            className="pl-10 h-12 rounded-xl bg-card border-border/50"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-border/50">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Class Overview */}
      <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
        <h2 className="text-xl font-bold text-foreground mb-6">Class Overview by Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjectProgress.map((subject) => (
            <div key={subject.subject}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">{subject.subject}</span>
                <span className="text-sm font-bold text-muted-foreground">{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} className="h-3 bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Student Grid */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">All Students ({students.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((student) => (
            <StudentCard key={student.name} {...student} />
          ))}
        </div>
      </div>
    </div>
  );
}
