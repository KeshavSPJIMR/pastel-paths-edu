import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
// TODO: Import QuizGenEngine from API or create service wrapper
// import { QuizGenEngine } from "@/../../server/src/index";

interface CurriculumFile {
  name: string;
  content: string;
  type: string;
  size: number;
}

interface CurriculumUploadDialogProps {
  onCurriculumUploaded?: (file: CurriculumFile, subject: string, gradeLevel: string) => void;
}

const gradeLabels: Record<string, string> = {
  kindergarten: "Kindergarten",
  grade_1: "Grade 1",
  grade_2: "Grade 2",
  grade_3: "Grade 3",
  grade_4: "Grade 4",
  grade_5: "Grade 5",
};

const subjectLabels: Record<string, string> = {
  math: "Math",
  reading: "Reading",
  science: "Science",
  social_studies: "Social Studies",
  language_arts: "Language Arts",
  art: "Art",
  music: "Music",
  physical_education: "Physical Education",
};

export function CurriculumUploadDialog({ onCurriculumUploaded }: CurriculumUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [subject, setSubject] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [curriculumStandard, setCurriculumStandard] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = [
    '.txt',
    '.doc',
    '.docx',
    '.pdf',
    '.md',
    '.rtf',
  ];

  const acceptedMimeTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'application/rtf',
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    const isValidType = acceptedFileTypes.includes(fileExtension) || 
                       acceptedMimeTypes.includes(selectedFile.type);

    if (!isValidType) {
      toast.error("Invalid file type", {
        description: `Please upload one of the following: ${acceptedFileTypes.join(', ')}`,
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 10MB",
      });
      return;
    }

    setFile(selectedFile);
    
    // Read file content
    try {
      const content = await readFileContent(selectedFile);
      setFileContent(content);
      
      // Show preview
      const previewLength = 500;
      const preview = content.length > previewLength 
        ? content.substring(0, previewLength) + '...'
        : content;
      
      toast.success("File loaded successfully", {
        description: `Loaded ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to read file";
      toast.error("Failed to read file", {
        description: errorMessage,
      });
      setFile(null);
      setFileContent("");
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else if (content instanceof ArrayBuffer) {
          // For binary files like PDF, we'd need a library to parse them
          // For now, we'll handle text files
          reject(new Error("Binary files require additional processing"));
        } else {
          reject(new Error("Failed to read file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      // Read as text for .txt, .md, .rtf files
      if (file.type === 'text/plain' || 
          file.type === 'text/markdown' || 
          file.type === 'application/rtf' ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.rtf')) {
        reader.readAsText(file);
      } 
      // For .doc/.docx and .pdf, we'd need specialized libraries
      // For now, we'll try reading as text and show a warning
      else if (file.type.includes('wordprocessingml') || 
               file.type === 'application/msword' ||
               file.type === 'application/pdf') {
        toast.warning("Advanced file format detected", {
          description: "For best results with .doc/.docx/.pdf files, please convert to .txt or .md first. Basic text extraction will be attempted.",
        });
        // Try reading as text (may not work well for binary formats)
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!file || !fileContent) {
      toast.error("Please select a curriculum file");
      return;
    }

    if (!subject) {
      toast.error("Please select a subject area");
      return;
    }

    if (!gradeLevel) {
      toast.error("Please select a grade level");
      return;
    }

    setIsProcessing(true);

    try {
      // Create curriculum file object
      const curriculumFile: CurriculumFile = {
        name: file.name,
        content: fileContent,
        type: file.type,
        size: file.size,
      };

      // Notify parent component
      onCurriculumUploaded?.(curriculumFile, subject, gradeLevel);

      // Optionally, process with QuizGen Engine here
      // For now, we'll just store the file info
      toast.success("Curriculum file uploaded successfully!", {
        description: `"${file.name}" is ready for quiz/assignment generation.`,
      });

      // Reset form
      handleRemoveFile();
      setSubject("");
      setGradeLevel("");
      setCurriculumStandard("");
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload curriculum";
      toast.error("Upload failed", {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!fileContent || !subject || !gradeLevel) {
      toast.error("Please upload a file and select subject/grade first");
      return;
    }

    setIsProcessing(true);

    try {
      // Call QuizGen Engine API endpoint
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          curriculumText: fileContent,
          gradeLevel,
          subject,
          curriculumStandard: curriculumStandard || undefined,
          numberOfQuestions: 5,
          difficulty: 'medium',
          // TODO: Get teacherId from auth context
          // teacherId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate quiz' }));
        throw new Error(errorData.message || errorData.error || 'Failed to generate quiz');
      }

      const result = await response.json();
      const { quiz, assignment, metadata } = result;

      // Show success message
      toast.success("Quiz generated successfully!", {
        description: `Generated ${quiz.questions.length} questions for ${subjectLabels[subject] || subject} (${gradeLabels[gradeLevel] || gradeLevel}).`,
        duration: 5000,
      });

      // Log quiz result
      console.log("Generated quiz:", quiz);
      console.log("Saved assignment:", assignment);

      // If quiz was saved to database, show assignment ID
      if (assignment?.id) {
        toast.info("Quiz saved to database", {
          description: `Assignment ID: ${assignment.id}. You can now assign this quiz to students.`,
          duration: 5000,
        });
      }

      // Notify parent that quiz was generated
      onCurriculumUploaded?.(
        {
          name: file?.name || 'curriculum.txt',
          content: fileContent,
          type: file?.type || 'text/plain',
          size: file?.size || 0,
        },
        subject,
        gradeLevel
      );

      // TODO: Show quiz preview in a modal or redirect to quiz editor
      // For now, we'll just show success and the quiz is saved to database

      // Reset form after successful generation
      handleRemoveFile();
      setSubject("");
      setGradeLevel("");
      setCurriculumStandard("");
      setOpen(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz";
      toast.error("Quiz generation failed", {
        description: errorMessage,
        duration: 5000,
      });
      console.error("Quiz generation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          Upload Curriculum
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Curriculum File</DialogTitle>
          <DialogDescription>
            Upload a curriculum file that the AI will use to generate quizzes and assignments.
            Supported formats: .txt, .md, .doc, .docx, .pdf (max 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="curriculum-file">Curriculum File</Label>
            {!file ? (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="curriculum-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {acceptedFileTypes.join(', ').toUpperCase()} (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="curriculum-file"
                    type="file"
                    className="hidden"
                    accept={acceptedFileTypes.join(',')}
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  {fileContent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {fileContent.length} characters loaded
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Area *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(subjectLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="grade-level">Grade Level *</Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger id="grade-level">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(gradeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curriculum Standard (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="curriculum-standard">Curriculum Standard (Optional)</Label>
            <Input
              id="curriculum-standard"
              placeholder="e.g., CCSS.3.ESS.2.1"
              value={curriculumStandard}
              onChange={(e) => setCurriculumStandard(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter curriculum standard code (e.g., Common Core, state standards)
            </p>
          </div>

          {/* File Content Preview */}
          {fileContent && fileContent.length > 0 && (
            <div className="space-y-2">
              <Label>File Preview</Label>
              <div className="p-3 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {fileContent.length > 1000 
                    ? fileContent.substring(0, 1000) + '...\n\n[... Content truncated for preview ...]'
                    : fileContent}
                </pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit}
            disabled={isProcessing || !file || !subject || !gradeLevel}
          >
            {isProcessing ? "Processing..." : "Upload & Save"}
          </Button>
          <Button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={isProcessing || !fileContent || !subject || !gradeLevel}
          >
            {isProcessing ? "Generating..." : "Generate Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
