
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PracticeSection from './PracticeSection';
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
          
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Study Plans</h3>
            <p>Follow structured study plans based on your timeline and goals.</p>
            <ul className="list-disc list-inside mt-2 text-gray-700">
              <li>1-month intensive plan</li>
              <li>3-month comprehensive plan</li>
              <li>6-month gradual preparation</li>
            </ul>
          </div>
        </div>

        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Score Improvement Strategies</h3>
          <p>Learn proven techniques to boost your SAT score:</p>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Error analysis & correction</li>
            <li>Subject-specific strategy guides</li>
            <li>Targeted practice for weak areas</li>
            <li>Mental preparation & test anxiety management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SATContent;
