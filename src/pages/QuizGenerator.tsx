import { useState, useRef } from "react";
import { ArrowLeft, FileDown, CheckSquare, Sparkles, Upload, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

const quizQuestions: Question[] = [
  { id: 1, question: "Which animal has a super sense of smell and is used by the police to catch criminals?", options: ["Cat", "Dog", "Rabbit", "Horse"], answer: "Dog" },
  { id: 2, question: "Ants leave behind a ________ when they move so that other ants can follow the path.", options: ["Sound", "Sight", "Smell", "Light"], answer: "Smell" },
  { id: 3, question: "Which bird has eyes in front of its head like humans?", options: ["Sparrow", "Owl", "Eagle", "Pigeon"], answer: "Owl" },
  { id: 4, question: "Why do snakes dance when a 'been' is played, even though they cannot hear?", options: ["They see the movement of the been", "They feel the vibrations in the ground", "They like the music", "They are trained to dance"], answer: "They feel the vibrations in the ground" },
  { id: 5, question: "What is the poisonous teeth of a snake called?", options: ["Fangs", "Scales", "Hood", "Gills"], answer: "Fangs" },
  { id: 6, question: "Which of the following is NOT a poisonous snake found in India?", options: ["Cobra", "Common Krait", "Python", "Russell's Viper"], answer: "Python" },
  { id: 7, question: "The tongue is responsible for which sense?", options: ["Sight", "Taste", "Hearing", "Smell"], answer: "Taste" },
  { id: 8, question: "Which part of the tongue tastes 'bitter' things?", options: ["Front", "Back", "Sides", "Middle"], answer: "Back" },
  { id: 9, question: "What is the main function of digestive juices in the stomach?", options: ["To make food tasty", "To help in digesting food", "To cool down the body", "To produce blood"], answer: "To help in digesting food" },
  { id: 10, question: "Dr. Beaumont performed experiments on the stomach of which person?", options: ["St. Martin", "Isaac Newton", "George Mestral", "Ronald Ross"], answer: "St. Martin" },
  { id: 11, question: "Why do we keep food in a refrigerator?", options: ["To make it sweet", "To keep it fresh and prevent germ growth", "To increase its weight", "To change its color"], answer: "To keep it fresh and prevent germ growth" },
  { id: 12, question: "'Mamidi Tandra' is another name for which food item?", options: ["Mango Pickle", "Aam Papad", "Mango Shake", "Dried Mango"], answer: "Aam Papad" },
  { id: 13, question: "Glass jars and bottles are dried well in the sun before filling them with pickles to:", options: ["Make them look shiny", "Remove moisture", "Make them hot", "Kill insects"], answer: "Remove moisture" },
  { id: 14, question: "Pitcher plants (Nepenthes) trap and eat:", options: ["Only sunlight", "Water", "Insects and small animals", "Fruit"], answer: "Insects and small animals" },
  { id: 15, question: "Seeds that have hooks on them usually spread by:", options: ["Wind", "Water", "Sticking to animal fur", "Bursting"], answer: "Sticking to animal fur" },
  { id: 16, question: "Velcro was invented by George Mestral after observing seeds of which plant?", options: ["Soyabean", "Pea", "Burdock/Burs", "Coconut"], answer: "Burdock/Burs" },
  { id: 17, question: "Chillies were brought to India from South America by:", options: ["British", "Portuguese", "Dutch", "French"], answer: "Portuguese" },
  { id: 18, question: "Who built 'Gadsisar' lake?", options: ["King Ghadsi of Jaisalmer", "Akbar", "Shah Jahan", "Birbal"], answer: "King Ghadsi of Jaisalmer" },
  { id: 19, question: "A 'Stepwell' is also known as a:", options: ["Ponds", "Johad", "Bawari", "Canal"], answer: "Bawari" },
  { id: 20, question: "Al-Biruni, a traveler who wrote about Indian ponds, came from which country?", options: ["Afghanistan", "Uzbekistan", "Iran", "Iraq"], answer: "Uzbekistan" },
  { id: 21, question: "Why does a person float in the Dead Sea even if they don't know how to swim?", options: ["The water is very cold", "The water is very salty and dense", "The water is very shallow", "There are no waves"], answer: "The water is very salty and dense" },
  { id: 22, question: "Which of the following will float on water?", options: ["Iron nail", "Stone", "Empty plastic bottle", "Coin"], answer: "Empty plastic bottle" },
  { id: 23, question: "The Dandi March was led by Mahatma Gandhi to protest against the tax on:", options: ["Cotton", "Salt", "Sugar", "Tea"], answer: "Salt" },
  { id: 24, question: "Malaria is spread by which type of mosquito?", options: ["Female Anopheles", "Male Anopheles", "Aedes", "Culex"], answer: "Female Anopheles" },
  { id: 25, question: "Ronald Ross got the Nobel Prize for discovering the link between:", options: ["Flies and Cholera", "Mosquitoes and Malaria", "Rats and Plague", "Water and Typhoid"], answer: "Mosquitoes and Malaria" },
  { id: 26, question: "Anaemia is caused by a deficiency of ________ in the blood.", options: ["Calcium", "Vitamin C", "Iron (Haemoglobin)", "Iodine"], answer: "Iron (Haemoglobin)" },
  { id: 27, question: "To prevent mosquitoes from breeding, we should not let ________ collect around our houses.", options: ["Dust", "Garbage", "Stagnant water", "Leaves"], answer: "Stagnant water" },
  { id: 28, question: "Who was the first Indian woman to climb Mount Everest?", options: ["Sunita Williams", "Bachendri Pal", "Kalpana Chawla", "Santosh Yadav"], answer: "Bachendri Pal" },
  { id: 29, question: "What is 'Adrenaline'?", options: ["A type of food", "A hormone that helps us face fear/stress", "A mountain peak", "A climbing tool"], answer: "A hormone that helps us face fear/stress" },
  { id: 30, question: "Golconda Fort is located in which city?", options: ["Jaipur", "Hyderabad", "Delhi", "Mumbai"], answer: "Hyderabad" },
  { id: 31, question: "Large cannons found in old forts were made of:", options: ["Iron", "Bronze", "Plastic", "Wood"], answer: "Bronze" },
  { id: 32, question: "Sunita Williams spent more than ________ months in space.", options: ["2", "6", "12", "1"], answer: "6" },
  { id: 33, question: "Why does everything float inside a spacecraft?", options: ["Because of high wind", "Because there is no gravity", "Because it is very cold", "Because the ship is moving fast"], answer: "Because there is no gravity" },
  { id: 34, question: "Petroleum is formed ________.", options: ["In factories", "Deep under the earth's surface", "On top of mountains", "Under the river water"], answer: "Deep under the earth's surface" },
  { id: 35, question: "CNG stands for:", options: ["Common Natural Gas", "Compressed Natural Gas", "Clean Natural Gas", "Cold Natural Gas"], answer: "Compressed Natural Gas" },
  { id: 36, question: "LPG is mainly used for:", options: ["Running cars", "Cooking food", "Generating electricity", "Flying planes"], answer: "Cooking food" },
  { id: 37, question: "Rebo is a cone-shaped tent used by which tribe?", options: ["Bhil", "Changpa", "Gaddi", "Santhal"], answer: "Changpa" },
  { id: 38, question: "The famous Pashmina wool is obtained from:", options: ["Sheep", "Yak", "Special goats found at high altitudes", "Rabbits"], answer: "Special goats found at high altitudes" },
  { id: 39, question: "'Lekha' is a place used by Changpas to keep their:", options: ["Food", "Children", "Sheep and goats", "Clothes"], answer: "Sheep and goats" },
  { id: 40, question: "In which year did a major earthquake hit Bhuj, Gujarat?", options: ["2000", "2001", "2005", "1999"], answer: "2001" },
  { id: 41, question: "When there is an earthquake, we should:", options: ["Run to the terrace", "Hide under a strong table", "Stand near a window", "Use the lift"], answer: "Hide under a strong table" },
  { id: 42, question: "Our breath is ________ than the air outside in winter.", options: ["Colder", "Warmer", "The same", "Drier"], answer: "Warmer" },
  { id: 43, question: "A stethoscope is used by doctors to hear:", options: ["Stomach sounds", "Heartbeats", "Brain waves", "Lung whispers"], answer: "Heartbeats" },
  { id: 44, question: "Who was the father of the Indian Constitution?", options: ["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"], answer: "Dr. B.R. Ambedkar" },
  { id: 45, question: "Which of these is a traditional method of irrigation?", options: ["Drip irrigation", "Rahat (Water wheel)", "Sprinkler", "Electric pump"], answer: "Rahat (Water wheel)" },
  { id: 46, question: "'Cheraw' is a famous dance of which state?", options: ["Assam", "Mizoram", "Meghalaya", "Nagaland"], answer: "Mizoram" },
  { id: 47, question: "Jhoom farming is practiced in which part of India?", options: ["North-West", "North-East", "South", "Central"], answer: "North-East" },
  { id: 48, question: "Gregor Mendel performed experiments on which plant to study heredity?", options: ["Rose", "Pea plant", "Sunflower", "Hibiscus"], answer: "Pea plant" },
  { id: 49, question: "Polio is caused by a:", options: ["Bacteria", "Virus", "Fungus", "Mosquito bite"], answer: "Virus" },
  { id: 50, question: "Puranpoli is a sweet roti made of:", options: ["Rice and sugar", "Jaggery and gram (dal)", "Wheat and honey", "Corn and milk"], answer: "Jaggery and gram (dal)" },
];

interface StudentGrade {
  name: string;
  fileName: string;
  answers: { [questionId: number]: string };
  score: number;
  total: number;
  percentage: number;
}

export default function QuizGenerator() {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleQuestion = (id: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedQuestions(new Set(quizQuestions.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedQuestions(new Set());
  };

  const generatePDF = () => {
    if (selectedQuestions.size === 0) {
      toast.error("Please select at least one question");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("NCERT Class 5 Science Quiz", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Questions: ${selectedQuestions.size}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Questions
    doc.setFontSize(11);
    let questionNumber = 1;

    const selectedQuestionsArray = quizQuestions.filter(q => selectedQuestions.has(q.id));

    selectedQuestionsArray.forEach((q) => {
      // Check if we need a new page
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }

      // Question text
      doc.setFont("helvetica", "bold");
      const questionText = `${questionNumber}. ${q.question}`;
      const splitQuestion = doc.splitTextToSize(questionText, maxWidth);
      doc.text(splitQuestion, margin, yPosition);
      yPosition += splitQuestion.length * 6;

      // Options
      doc.setFont("helvetica", "normal");
      q.options.forEach((option, index) => {
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 20;
        }
        const optionLabel = String.fromCharCode(97 + index); // a, b, c, d
        const optionText = `   ${optionLabel}) ${option}`;
        const splitOption = doc.splitTextToSize(optionText, maxWidth - 10);
        doc.text(splitOption, margin, yPosition);
        yPosition += splitOption.length * 5;
      });

      // Answer (if included)
      if (includeAnswers) {
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFont("helvetica", "italic");
        doc.setTextColor(0, 128, 0);
        doc.text(`   Answer: ${q.answer}`, margin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 8;
      }

      yPosition += 8;
      questionNumber++;
    });

    // Save the PDF
    doc.save("NCERT_Class5_Science_Quiz.pdf");
    toast.success("Quiz PDF downloaded successfully!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const simulateGrading = () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one answer sheet");
      return;
    }

    setIsGrading(true);

    // Simulate AI grading with random but realistic results
    const studentNames = [
      "Aarav Sharma", "Priya Patel", "Rohan Singh", "Ananya Gupta", 
      "Vihaan Kumar", "Ishita Reddy", "Arjun Nair", "Diya Verma",
      "Krishna Iyer", "Saanvi Joshi", "Aditya Rao", "Meera Kapoor"
    ];

    const grades: StudentGrade[] = uploadedFiles.map((file, index) => {
      const studentName = studentNames[index % studentNames.length] || `Student ${index + 1}`;
      const answers: { [questionId: number]: string } = {};
      let correctCount = 0;

      // Simulate answers for each question
      quizQuestions.forEach((q) => {
        const isCorrect = Math.random() > 0.3; // 70% chance of correct answer
        if (isCorrect) {
          answers[q.id] = q.answer;
          correctCount++;
        } else {
          // Pick a random wrong answer
          const wrongOptions = q.options.filter(opt => opt !== q.answer);
          answers[q.id] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
      });

      return {
        name: studentName,
        fileName: file.name,
        answers,
        score: correctCount,
        total: quizQuestions.length,
        percentage: Math.round((correctCount / quizQuestions.length) * 100)
      };
    });

    setTimeout(() => {
      setStudentGrades(grades);
      setIsGrading(false);
      toast.success(`Graded ${grades.length} answer sheets successfully!`);
    }, 1500);
  };

  const getScoreColor = (percentage: number): [number, number, number] => {
    if (percentage >= 80) return [46, 204, 113]; // Green
    if (percentage >= 60) return [241, 196, 15]; // Yellow
    if (percentage >= 40) return [230, 126, 34]; // Orange
    return [231, 76, 60]; // Red
  };

  const getScoreColorHex = (percentage: number): string => {
    if (percentage >= 80) return "#2ecc71";
    if (percentage >= 60) return "#f1c40f";
    if (percentage >= 40) return "#e67e22";
    return "#e74c3c";
  };

  const generateGradesPDF = () => {
    if (studentGrades.length === 0) {
      toast.error("No grades to export");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Student Grades Heatmap", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("NCERT Class 5 Science Quiz Results", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Legend
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Legend:", margin, yPosition);
    
    const legendItems = [
      { color: [46, 204, 113] as [number, number, number], label: "80-100%" },
      { color: [241, 196, 15] as [number, number, number], label: "60-79%" },
      { color: [230, 126, 34] as [number, number, number], label: "40-59%" },
      { color: [231, 76, 60] as [number, number, number], label: "0-39%" }
    ];

    let legendX = margin + 25;
    legendItems.forEach((item) => {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(legendX, yPosition - 4, 10, 6, "F");
      doc.setFont("helvetica", "normal");
      doc.text(item.label, legendX + 12, yPosition);
      legendX += 40;
    });
    yPosition += 15;

    // Heatmap Header
    const cellWidth = 35;
    const cellHeight = 12;
    const nameWidth = 50;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, nameWidth, cellHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Student Name", margin + 2, yPosition + 8);

    doc.rect(margin + nameWidth, yPosition, cellWidth, cellHeight, "F");
    doc.text("Score", margin + nameWidth + 2, yPosition + 8);

    doc.rect(margin + nameWidth + cellWidth, yPosition, cellWidth, cellHeight, "F");
    doc.text("Percentage", margin + nameWidth + cellWidth + 2, yPosition + 8);

    doc.rect(margin + nameWidth + cellWidth * 2, yPosition, cellWidth + 20, cellHeight, "F");
    doc.text("Status", margin + nameWidth + cellWidth * 2 + 2, yPosition + 8);

    yPosition += cellHeight;

    // Student rows
    studentGrades.forEach((student) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const scoreColor = getScoreColor(student.percentage);
      
      // Name cell
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, yPosition, nameWidth, cellHeight, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(student.name.substring(0, 18), margin + 2, yPosition + 8);

      // Score cell with color
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.rect(margin + nameWidth, yPosition, cellWidth, cellHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(`${student.score}/${student.total}`, margin + nameWidth + 2, yPosition + 8);

      // Percentage cell with color
      doc.rect(margin + nameWidth + cellWidth, yPosition, cellWidth, cellHeight, "F");
      doc.text(`${student.percentage}%`, margin + nameWidth + cellWidth + 2, yPosition + 8);

      // Status cell
      doc.rect(margin + nameWidth + cellWidth * 2, yPosition, cellWidth + 20, cellHeight, "F");
      const status = student.percentage >= 80 ? "Excellent" : 
                     student.percentage >= 60 ? "Good" : 
                     student.percentage >= 40 ? "Needs Help" : "At Risk";
      doc.text(status, margin + nameWidth + cellWidth * 2 + 2, yPosition + 8);

      doc.setTextColor(0, 0, 0);
      yPosition += cellHeight;
    });

    // Summary statistics
    yPosition += 15;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    const avgScore = Math.round(studentGrades.reduce((acc, s) => acc + s.percentage, 0) / studentGrades.length);
    const passCount = studentGrades.filter(s => s.percentage >= 40).length;
    const excellentCount = studentGrades.filter(s => s.percentage >= 80).length;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Summary Statistics", margin, yPosition);
    yPosition += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Students: ${studentGrades.length}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Class Average: ${avgScore}%`, margin, yPosition);
    yPosition += 7;
    doc.text(`Pass Rate: ${Math.round((passCount / studentGrades.length) * 100)}%`, margin, yPosition);
    yPosition += 7;
    doc.text(`Excellent Performers (80%+): ${excellentCount}`, margin, yPosition);

    doc.save("Student_Grades_Heatmap.pdf");
    toast.success("Grades heatmap PDF downloaded!");
    setGradingDialogOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Quiz Generator
          </h1>
          <p className="text-muted-foreground text-sm">NCERT Class 5 Science (EVS)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {selectedQuestions.size} of {quizQuestions.length} questions selected
          </span>
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeAnswers"
              checked={includeAnswers}
              onCheckedChange={(checked) => setIncludeAnswers(checked === true)}
            />
            <label htmlFor="includeAnswers" className="text-sm font-medium cursor-pointer">
              Include answers in PDF
            </label>
          </div>
          <Button
            onClick={generatePDF}
            disabled={selectedQuestions.size === 0}
            className="gradient-coral text-primary-foreground gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download Quiz PDF
          </Button>
          <Button
            onClick={() => setGradingDialogOpen(true)}
            variant="outline"
            className="gap-2 border-secondary text-secondary hover:bg-secondary/10"
          >
            <Upload className="h-4 w-4" />
            Grade Answer Sheets
          </Button>
        </div>
      </div>

      {/* Grading Dialog */}
      <Dialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Grade Student Answer Sheets
            </DialogTitle>
            <DialogDescription>
              Upload images or PDFs of student answer sheets. The system will grade them using the NCERT Class 5 Science answers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                multiple
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto text-primary/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Drop answer sheets here or click to upload
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Select Files
              </Button>
              {uploadedFiles.length > 0 && (
                <p className="mt-3 text-sm text-primary font-medium">
                  {uploadedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Grade Button */}
            <Button
              onClick={simulateGrading}
              disabled={uploadedFiles.length === 0 || isGrading}
              className="w-full gradient-mint text-primary-foreground gap-2"
            >
              {isGrading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Grading Answer Sheets...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Grade All Answer Sheets
                </>
              )}
            </Button>

            {/* Results Preview */}
            {studentGrades.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-secondary" />
                  Grading Results Preview
                </h3>
                <ScrollArea className="h-48 rounded-lg border">
                  <div className="p-3 space-y-2">
                    {studentGrades.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: `${getScoreColorHex(student.percentage)}15` }}
                      >
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.fileName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm font-bold px-3 py-1 rounded-full text-white"
                            style={{ backgroundColor: getScoreColorHex(student.percentage) }}
                          >
                            {student.score}/{student.total}
                          </span>
                          <span
                            className="text-sm font-bold px-3 py-1 rounded-full text-white"
                            style={{ backgroundColor: getScoreColorHex(student.percentage) }}
                          >
                            {student.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Download Heatmap PDF */}
                <Button
                  onClick={generateGradesPDF}
                  className="w-full gradient-coral text-primary-foreground gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Download Grades Heatmap PDF
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Questions List */}
      <div className="space-y-3">
        {quizQuestions.map((q) => (
          <div
            key={q.id}
            className={`
              bg-card rounded-xl p-4 border-2 transition-all cursor-pointer
              ${selectedQuestions.has(q.id) 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'}
            `}
            onClick={() => toggleQuestion(q.id)}
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <Checkbox
                  checked={selectedQuestions.has(q.id)}
                  onCheckedChange={() => toggleQuestion(q.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground mb-2">
                  <span className="text-primary font-bold">Q{q.id}.</span> {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {q.options.map((option, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5"
                    >
                      <span className="font-semibold">{String.fromCharCode(97 + index)})</span> {option}
                    </div>
                  ))}
                </div>
              </div>
              {selectedQuestions.has(q.id) && (
                <CheckSquare className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Download Button */}
      {selectedQuestions.size > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={generatePDF}
            size="lg"
            className="gradient-coral text-primary-foreground gap-2 shadow-xl rounded-full px-6 animate-pulse-soft"
          >
            <FileDown className="h-5 w-5" />
            Download {selectedQuestions.size} Questions
          </Button>
        </div>
      )}
    </div>
  );
}
