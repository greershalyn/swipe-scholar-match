
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from 'lucide-react';
import QuizResultCard from './QuizResultCard';
import { supabase } from "@/integrations/supabase/client";

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

// Track previously seen question IDs across quiz sessions
const seenQuestionsMap: Record<string, Set<string>> = {};

const Quiz = ({ questions: originalQuestions, sectionTitle, onComplete }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // Extract section and category from the sectionTitle (e.g., "ACT - English Section" => "act", "english")
  const getQuizSectionAndCategory = () => {
    if (sectionTitle.toLowerCase().includes('act')) {
      return { 
        section: 'act', 
        category: sectionTitle.replace('ACT - ', '').replace(' Section', '').toLowerCase() 
      };
    } else {
      return { 
        section: 'sat', 
        category: sectionTitle.replace('SAT - ', '').replace(' Section', '').toLowerCase() 
      };
    }
  };
  
  // Function to request AI-generated questions
  const generateAIQuestions = async () => {
    setIsLoadingQuestions(true);
    
    try {
      const { section, category } = getQuizSectionAndCategory();
      
      toast({
        title: "Generating New Questions",
        description: "We're creating fresh questions just for you...",
      });
      
      const { data, error } = await supabase.functions.invoke('generate-quiz-questions', {
        body: { section, category }
      });
      
      if (error) {
        console.error('Error generating questions:', error);
        toast({
          title: "Error Generating Questions",
          description: "We couldn't generate new questions. Using existing ones instead.",
          variant: "destructive",
        });
        selectQuizQuestions();
      } else if (data && data.questions && data.questions.length > 0) {
        console.log('AI generated questions:', data.questions);
        setQuestions(data.questions);
        toast({
          title: "Fresh Questions Ready",
          description: "We've created brand new questions for you!",
        });
      } else {
        console.warn('No questions returned from AI service');
        toast({
          title: "Using Backup Questions",
          description: "We couldn't generate new questions. Using existing ones instead.",
        });
        selectQuizQuestions();
      }
    } catch (error) {
      console.error('Error in generateAIQuestions:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Using existing questions instead.",
        variant: "destructive",
      });
      selectQuizQuestions();
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  // Function to select questions for the quiz with preference for unseen ones
  const selectQuizQuestions = () => {
    // Create a unique key for this quiz section to track its seen questions
    const quizKey = `${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Initialize seen questions set for this quiz if it doesn't exist
    if (!seenQuestionsMap[quizKey]) {
      seenQuestionsMap[quizKey] = new Set<string>();
    }
    
    // Get the set of seen question IDs for this quiz
    const seenQuestions = seenQuestionsMap[quizKey];
    
    // Separate questions into seen and unseen
    const unseenQuestions = originalQuestions.filter(q => !seenQuestions.has(q.id));
    const previouslySeen = originalQuestions.filter(q => seenQuestions.has(q.id));
    
    // If we have enough unseen questions, use those
    // Otherwise, mix in some previously seen ones
    let selectedQuestions: QuizQuestion[] = [];
    
    // We'll show 3 questions per quiz (or fewer if not enough questions exist)
    const questionsToShow = Math.min(3, originalQuestions.length);
    
    if (unseenQuestions.length >= questionsToShow) {
      // We have enough unseen questions
      selectedQuestions = [...unseenQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, questionsToShow);
    } else {
      // Use all unseen questions + some previously seen ones
      selectedQuestions = [
        ...unseenQuestions,
        ...previouslySeen
          .sort(() => Math.random() - 0.5)
          .slice(0, questionsToShow - unseenQuestions.length)
      ];
      
      // If we've seen all questions, reset the seen questions tracking
      // for this quiz to keep it fresh
      if (unseenQuestions.length === 0 && seenQuestions.size === originalQuestions.length) {
        console.log(`All questions seen for ${quizKey}, resetting tracking`);
        seenQuestionsMap[quizKey].clear();
      }
    }
    
    // Shuffle the final selection
    const shuffled = selectedQuestions.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    
    // Log for debugging
    console.log(`Quiz ${quizKey}: ${unseenQuestions.length} unseen, ${previouslySeen.length} seen, showing ${shuffled.length} questions`);
  };
  
  // Initialize questions - either from original set or AI-generated
  useEffect(() => {
    selectQuizQuestions();
  }, [originalQuestions, sectionTitle]);

  // Make sure we have the current question
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
      // Track seen questions for this quiz section
      const quizKey = `${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Mark all questions in this session as seen
      questions.forEach(q => {
        seenQuestionsMap[quizKey].add(q.id);
      });
      
      setQuizCompleted(true);
      if (onComplete) {
        onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length);
      }
    }
  };

  const handleRestartQuiz = () => {
    // Reset the quiz state
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const handleNewQuestions = async () => {
    // Reset the quiz state
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    
    // Generate brand new AI questions
    await generateAIQuestions();
  };

  if (isLoadingQuestions) {
    return (
      <Card className="mt-4 bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-lg font-medium">Generating fresh questions just for you...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <div>Loading questions...</div>;
  }

  if (quizCompleted) {
    const finalScore = score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
    return (
      <QuizResultCard
        score={finalScore}
        totalQuestions={questions.length}
        onRestartQuiz={handleRestartQuiz}
        onNewQuestions={handleNewQuestions}
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
          <p className="text-lg font-medium mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></p>
          
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
