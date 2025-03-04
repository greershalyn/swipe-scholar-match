
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

type QuizResultCardProps = {
  score: number;
  totalQuestions: number;
  onRestartQuiz: () => void;
};

const QuizResultCard = ({ score, totalQuestions, onRestartQuiz }: QuizResultCardProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <Card className="mt-4 bg-white">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">Quiz Completed!</h3>
        <div className="text-center py-6">
          <div className="text-4xl font-bold mb-2">{percentage}%</div>
          <p className="text-lg mb-4">You scored {score} out of {totalQuestions}</p>
          
          {percentage >= 70 ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
              <CheckCircle className="h-6 w-6" />
              <span>Great job! You have a good understanding of this topic.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-6">
              <XCircle className="h-6 w-6" />
              <span>You might want to review this topic a bit more.</span>
            </div>
          )}
          
          <Button onClick={onRestartQuiz} className="mt-4">
            Restart Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResultCard;
