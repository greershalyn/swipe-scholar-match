
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PracticeSection from './PracticeSection';
import StrategySection from './StrategySection';
import { quizData } from '@/data/testPrepQuizzes';

type ACTContentProps = {
  activeQuizzes: Record<string, boolean>;
  toggleQuiz: (quizId: string) => void;
  handleQuizComplete: (sectionTitle: string, score: number, total: number) => void;
};

const ACTContent = ({ activeQuizzes, toggleQuiz, handleQuizComplete }: ACTContentProps) => {
  return (
    <Card className="bg-slate-50">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4">ACT Preparation Resources</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PracticeSection
            title="English Section"
            description="Master grammar, punctuation, and rhetoric with our comprehensive guides."
            topics={[
              "Grammar rules review",
              "Punctuation practice",
              "Sentence structure analysis"
            ]}
            quizId="act-english"
            isQuizActive={activeQuizzes['act-english']}
            toggleQuiz={toggleQuiz}
            questions={quizData.act.english.questions}
            onQuizComplete={handleQuizComplete}
          />
          
          <PracticeSection
            title="Math Section"
            description="Review key algebra, geometry, and trigonometry concepts."
            topics={[
              "Algebra & functions",
              "Geometry & trigonometry",
              "Statistics & probability"
            ]}
            quizId="act-math"
            isQuizActive={activeQuizzes['act-math']}
            toggleQuiz={toggleQuiz}
            questions={quizData.act.math.questions}
            onQuizComplete={handleQuizComplete}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PracticeSection
            title="Reading Section"
            description="Develop critical reading and comprehension skills for various text types."
            topics={[
              "Literary narrative analysis",
              "Social science passage strategies",
              "Humanities & natural science reading"
            ]}
            quizId="act-reading"
            isQuizActive={activeQuizzes['act-reading']}
            toggleQuiz={toggleQuiz}
            questions={quizData.act.reading.questions}
            onQuizComplete={handleQuizComplete}
          />
          
          <PracticeSection
            title="Science Section"
            description="Learn to interpret data, graphs, and scientific information quickly."
            topics={[
              "Data representation",
              "Research summaries",
              "Conflicting viewpoints"
            ]}
            quizId="act-science"
            isQuizActive={activeQuizzes['act-science']}
            toggleQuiz={toggleQuiz}
            questions={quizData.act.science.questions}
            onQuizComplete={handleQuizComplete}
          />
        </div>

        <PracticeSection
          title="Writing Section (Optional)"
          description="Develop essay-writing skills for the optional ACT Writing Test."
          topics={[
            "Essay structure & planning",
            "Developing arguments",
            "Practice prompts with feedback"
          ]}
          quizId="act-writing"
          isQuizActive={activeQuizzes['act-writing']}
          toggleQuiz={toggleQuiz}
          questions={quizData.act.writing.questions}
          onQuizComplete={handleQuizComplete}
        />

        <StrategySection
          title="Test-Taking Strategies"
          description="Master essential strategies for maximizing your ACT score:"
          strategies={[
            { 
              text: "Time management techniques", 
              tips: [
                "Allocate specific time to each section based on question count and difficulty",
                "For English: 9 minutes per passage (5 passages in 45 minutes)",
                "For Math: 1 minute per question, leaving 5 minutes for review",
                "For Reading: 8-9 minutes per passage (4 passages in 35 minutes)",
                "For Science: 5-6 minutes per passage (6-7 passages in 35 minutes)",
                "Skip difficult questions and return to them later to avoid time traps"
              ]
            },
            { 
              text: "Process of elimination", 
              tips: [
                "Always eliminate obviously incorrect answers first",
                "For reading passages, cross out answers that contradict the text",
                "In math, eliminate values that don't satisfy the given conditions",
                "For English questions, eliminate choices that create grammatical errors",
                "When two answers seem correct, look for subtle differences that make one better",
                "If stuck between two choices, try substituting each into the question context"
              ]
            },
            { 
              text: "Strategic guessing methods", 
              tips: [
                "Never leave an answer blank - there's no penalty for wrong answers",
                "If you can eliminate even one answer choice, guessing improves your odds",
                "Look for patterns in answer choices (the longest/most detailed is often correct)",
                "For math problems, try plugging in answer choices to check if they work",
                "In reading questions, be wary of extreme language (always, never, etc.)",
                "When completely unsure, choose the same letter consistently to improve probability"
              ]
            },
            { 
              text: "Practice test schedule planning", 
              tips: [
                "Take a diagnostic test 3-4 months before your exam date",
                "Schedule weekly practice sessions focusing on your weakest areas",
                "Complete at least 3-5 full-length practice tests under timed conditions",
                "Take your final practice test a week before the actual exam",
                "Review all your mistakes after each practice test",
                "Create a study calendar with specific goals for each week leading up to the test"
              ]
            }
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default ACTContent;
