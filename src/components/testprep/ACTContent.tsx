
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
            { text: "Time management techniques" },
            { text: "Process of elimination" },
            { text: "Strategic guessing methods" },
            { text: "Practice test schedule planning" }
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default ACTContent;
