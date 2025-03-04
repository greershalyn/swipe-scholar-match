
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from 'lucide-react';
import QuizResultCard from './QuizResultCard';

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizProps = {
  questions: QuizQuestion[];
  sectionTitle: string;
  onComplete?: (score: number, total: number) => void;
};

const Quiz = ({ questions, sectionTitle, onComplete }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (value: string) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(value);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Selection Required",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsAnswerSubmitted(true);
    
    // Check if answer is correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const finalScore = score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
    return (
      <QuizResultCard
        score={finalScore}
        totalQuestions={questions.length}
        onRestartQuiz={handleRestartQuiz}
      />
    );
  }

  return (
    <Card className="mt-4 bg-white">
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{sectionTitle} Quiz</h3>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        
        <div className="py-3 px-1">
          <p className="text-lg font-medium mb-4">{currentQuestion.question}</p>
          
          <RadioGroup value={selectedAnswer || ""} className="space-y-3" onValueChange={handleAnswerSelect}>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${
                isAnswerSubmitted && option === currentQuestion.correctAnswer 
                  ? 'bg-green-100 border border-green-300' 
                  : isAnswerSubmitted && option === selectedAnswer
                    ? 'bg-red-100 border border-red-300'
                    : 'hover:bg-gray-100'
              }`}>
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  disabled={isAnswerSubmitted}
                />
                <label 
                  htmlFor={`option-${index}`} 
                  className="flex-grow cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
                {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {isAnswerSubmitted && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isAnswerSubmitted && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium mb-1">Explanation:</p>
              <p className="text-sm">{currentQuestion.explanation}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            {!isAnswerSubmitted ? (
              <Button onClick={handleSubmitAnswer}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </Button>
            )}
            <div className="text-sm font-medium">
              Score: {score}/{currentQuestionIndex + (isAnswerSubmitted ? 1 : 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;
