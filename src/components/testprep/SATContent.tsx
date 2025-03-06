
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PracticeSection from './PracticeSection';
import StrategySection from './StrategySection';
import StudyPlanSection from './StudyPlanSection';
import { quizData } from '@/data/testPrepQuizzes';

type SATContentProps = {
  activeQuizzes: Record<string, boolean>;
  toggleQuiz: (quizId: string) => void;
  handleQuizComplete: (sectionTitle: string, score: number, total: number) => void;
};

const SATContent = ({ activeQuizzes, toggleQuiz, handleQuizComplete }: SATContentProps) => {
  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">SAT Preparation Resources</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PracticeSection
            title="Reading & Writing"
            description="Strengthen your verbal reasoning and comprehension skills."
            topics={[
              "Information & ideas",
              "Craft & structure analysis",
              "Expression of ideas",
              "Standard English conventions"
            ]}
            quizId="sat-reading-writing"
            isQuizActive={activeQuizzes['sat-reading-writing']}
            toggleQuiz={toggleQuiz}
            questions={quizData.sat.readingWriting.questions}
            onQuizComplete={handleQuizComplete}
          />
          
          <PracticeSection
            title="Math"
            description="Master problem-solving and data analysis techniques."
            topics={[
              "Heart of Algebra",
              "Problem solving & data analysis",
              "Passport to Advanced Math",
              "Additional topics in math"
            ]}
            quizId="sat-math"
            isQuizActive={activeQuizzes['sat-math']}
            toggleQuiz={toggleQuiz}
            questions={quizData.sat.math.questions}
            onQuizComplete={handleQuizComplete}
          />
        </div>

        <PracticeSection
          title="Digital SAT Format"
          description="Get familiar with the new digital SAT format and adaptive testing."
          topics={[
            "Navigating the digital interface",
            "Understanding module-based adaptive testing",
            "Digital tools and features",
            "Practice with simulated digital experience"
          ]}
          quizId="sat-digital-format"
          isQuizActive={activeQuizzes['sat-digital-format']}
          toggleQuiz={toggleQuiz}
          questions={quizData.sat.digitalFormat.questions}
          onQuizComplete={handleQuizComplete}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PracticeSection
            title="Practice Tests"
            description="Take full-length practice tests with detailed score reports."
            topics={[
              "Official College Board practice tests",
              "Timed test-taking practice",
              "Detailed scoring and analysis"
            ]}
            quizId="sat-practice"
            isQuizActive={activeQuizzes['sat-practice']}
            toggleQuiz={toggleQuiz}
            questions={quizData.sat.practiceTests.questions}
            onQuizComplete={handleQuizComplete}
          />
          
          <StudyPlanSection
            title="Study Plans"
            description="Follow structured study plans based on your timeline and goals."
            plans={[
              { text: "1-month intensive plan" },
              { text: "3-month comprehensive plan" },
              { text: "6-month gradual preparation" }
            ]}
          />
        </div>

        <StrategySection 
          title="Score Improvement Strategies"
          description="Learn proven techniques to boost your SAT score:"
          strategies={[
            { 
              text: "Error analysis & correction", 
              tips: [
                "Create an error log categorizing mistakes by question type",
                "Identify patterns in your incorrect answers (careless errors vs. knowledge gaps)",
                "Rework missed problems without looking at solutions first",
                "Study explanations for both incorrect AND correct answers",
                "Focus practice on your most frequent error types",
                "Review your error log weekly to track progress and adjust study plans"
              ]
            },
            { 
              text: "Subject-specific strategy guides", 
              tips: [
                "For Reading: Preview questions before passages to guide your reading",
                "For Writing: Learn the most commonly tested grammar rules (subject-verb agreement, pronoun usage)",
                "For Math: Memorize key formulas not provided in the reference sheet",
                "For Reading: Practice active reading by annotating passages",
                "For Writing: Look for the most concise answer that maintains meaning",
                "For Math: When stuck, try working backward from answer choices"
              ]
            },
            { 
              text: "Targeted practice for weak areas", 
              tips: [
                "Take topic-specific quizzes focusing only on your challenging areas",
                "Use official College Board questions sorted by difficulty level",
                "Set mini-goals for improvement in specific question types",
                "Use spaced repetition for concepts you struggle with most",
                "Create custom practice sets combining only your weak areas",
                "Schedule dedicated weekly sessions focusing on your lowest-scoring topics"
              ]
            },
            { 
              text: "Mental preparation & test anxiety management", 
              tips: [
                "Practice mindfulness techniques for 5-10 minutes before study sessions",
                "Visualize successful test performance during your preparation",
                "Develop a pre-test routine to follow on test day (morning routine, breakfast)",
                "Use positive self-talk to counter negative thoughts during practice",
                "Take practice tests in environments similar to the actual testing location",
                "Learn breathing exercises to use if anxiety surfaces during the test"
              ]
            }
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default SATContent;
