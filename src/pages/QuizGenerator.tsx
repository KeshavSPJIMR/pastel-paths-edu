import { useState } from "react";
import { ArrowLeft, FileDown, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";

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

export default function QuizGenerator() {
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [includeAnswers, setIncludeAnswers] = useState(false);

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
        </div>
      </div>

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
