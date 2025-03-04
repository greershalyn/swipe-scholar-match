
import React from 'react';
import { QuizQuestion } from './Quiz';
import Quiz from './Quiz';
import QuizToggleButton from './QuizToggleButton';

type PracticeSectionProps = {
  title: string;
  description: string;
  topics: string[];
  quizId: string;
  isQuizActive: boolean;
  toggleQuiz: (quizId: string) => void;
  questions: QuizQuestion[];
  onQuizComplete: (sectionTitle: string, score: number, total: number) => void;
};

const PracticeSection = ({
  title,
  description,
  topics,
  quizId,
  isQuizActive,
  toggleQuiz,
  questions,
  onQuizComplete
}: PracticeSectionProps) => {
  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <QuizToggleButton 
          isActive={isQuizActive} 
          onClick={() => toggleQuiz(quizId)} 
        />
      </div>
      <p>{description}</p>
      <ul className="list-disc list-inside mt-2 text-gray-700">
        {topics.map((topic, index) => (
          <li key={index}>{topic}</li>
        ))}
      </ul>
      
      {isQuizActive && (
        <Quiz 
          questions={questions}
          sectionTitle={title}
          onComplete={(score, total) => onQuizComplete(title, score, total)}
        />
      )}
    </div>
  );
};

export default PracticeSection;
