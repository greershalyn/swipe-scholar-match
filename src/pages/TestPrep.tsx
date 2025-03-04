
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileSpreadsheet, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { PremiumAccessPrompt } from '@/components/essay/PremiumAccessPrompt';
import Quiz from '@/components/testprep/Quiz';
import { quizData } from '@/data/testPrepQuizzes';
import { useToast } from '@/hooks/use-toast';

const TestPrep = () => {
  const { hasPremiumAccess, isCheckingAccess } = useSubscriptionCheck();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [activeQuizzes, setActiveQuizzes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  // If user doesn't have premium access, show the premium prompt
  if (!hasPremiumAccess) {
    return (
      <PremiumAccessPrompt
        showSubscriptionDialog={showSubscriptionDialog}
        setShowSubscriptionDialog={setShowSubscriptionDialog}
      />
    );
  }

  const toggleQuiz = (quizId: string) => {
    setActiveQuizzes(prev => ({
      ...prev,
      [quizId]: !prev[quizId]
    }));
  };

  const handleQuizComplete = (sectionTitle: string, score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    
    toast({
      title: `${sectionTitle} Quiz Completed!`,
      description: `You scored ${score} out of ${total} (${percentage}%)`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9b87f5] via-[#D946EF] to-[#FDE1D3]">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <img 
              src="/lovable-uploads/24f07198-1e4c-4eea-8e07-259aa77d1711.png"
              alt="SwipeScholar Logo"
              className="h-24 w-auto"
            />
          </Link>
          <AccountDropdown />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="h-8 w-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Test Prep</h1>
          </div>

          <Tabs defaultValue="act" className="mb-8">
            <TabsList className="grid grid-cols-2 w-[400px] mb-6">
              <TabsTrigger value="act" className="flex gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                ACT Prep
              </TabsTrigger>
              <TabsTrigger value="sat" className="flex gap-2">
                <BookOpen className="h-4 w-4" />
                SAT Prep
              </TabsTrigger>
            </TabsList>

            <TabsContent value="act">
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">ACT Preparation Resources</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">English Section</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('act-english')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['act-english'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['act-english'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Master grammar, punctuation, and rhetoric with our comprehensive guides.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Grammar rules review</li>
                        <li>Punctuation practice</li>
                        <li>Sentence structure analysis</li>
                      </ul>
                      
                      {activeQuizzes['act-english'] && (
                        <Quiz 
                          questions={quizData.act.english.questions} 
                          sectionTitle="English Section"
                          onComplete={(score, total) => handleQuizComplete("English Section", score, total)}
                        />
                      )}
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Math Section</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('act-math')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['act-math'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['act-math'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Review key algebra, geometry, and trigonometry concepts.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Algebra & functions</li>
                        <li>Geometry & trigonometry</li>
                        <li>Statistics & probability</li>
                      </ul>
                      
                      {activeQuizzes['act-math'] && (
                        <Quiz 
                          questions={quizData.act.math.questions}
                          sectionTitle="Math Section"
                          onComplete={(score, total) => handleQuizComplete("Math Section", score, total)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Reading Section</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('act-reading')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['act-reading'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['act-reading'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Develop critical reading and comprehension skills for various text types.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Literary narrative analysis</li>
                        <li>Social science passage strategies</li>
                        <li>Humanities & natural science reading</li>
                      </ul>
                      
                      {activeQuizzes['act-reading'] && (
                        <Quiz 
                          questions={quizData.act.reading.questions}
                          sectionTitle="Reading Section"
                          onComplete={(score, total) => handleQuizComplete("Reading Section", score, total)}
                        />
                      )}
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Science Section</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('act-science')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['act-science'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['act-science'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Learn to interpret data, graphs, and scientific information quickly.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Data representation</li>
                        <li>Research summaries</li>
                        <li>Conflicting viewpoints</li>
                      </ul>
                      
                      {activeQuizzes['act-science'] && (
                        <Quiz 
                          questions={quizData.act.science.questions}
                          sectionTitle="Science Section"
                          onComplete={(score, total) => handleQuizComplete("Science Section", score, total)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Writing Section (Optional)</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleQuiz('act-writing')}
                        className="flex items-center gap-1"
                      >
                        {activeQuizzes['act-writing'] ? 'Hide Quiz' : 'Take Quiz'}
                        {activeQuizzes['act-writing'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p>Develop essay-writing skills for the optional ACT Writing Test.</p>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      <li>Essay structure & planning</li>
                      <li>Developing arguments</li>
                      <li>Practice prompts with feedback</li>
                    </ul>
                    
                    {activeQuizzes['act-writing'] && (
                      <Quiz 
                        questions={quizData.act.writing.questions}
                        sectionTitle="Writing Section"
                        onComplete={(score, total) => handleQuizComplete("Writing Section", score, total)}
                      />
                    )}
                  </div>

                  <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Test-Taking Strategies</h3>
                    <p>Master essential strategies for maximizing your ACT score:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      <li>Time management techniques</li>
                      <li>Process of elimination</li>
                      <li>Strategic guessing methods</li>
                      <li>Practice test schedule planning</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sat">
              <Card className="bg-slate-50">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">SAT Preparation Resources</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Reading & Writing</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('sat-reading-writing')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['sat-reading-writing'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['sat-reading-writing'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Strengthen your verbal reasoning and comprehension skills.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Information & ideas</li>
                        <li>Craft & structure analysis</li>
                        <li>Expression of ideas</li>
                        <li>Standard English conventions</li>
                      </ul>
                      
                      {activeQuizzes['sat-reading-writing'] && (
                        <Quiz 
                          questions={quizData.sat.readingWriting.questions}
                          sectionTitle="Reading & Writing"
                          onComplete={(score, total) => handleQuizComplete("Reading & Writing", score, total)}
                        />
                      )}
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Math</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('sat-math')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['sat-math'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['sat-math'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Master problem-solving and data analysis techniques.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Heart of Algebra</li>
                        <li>Problem solving & data analysis</li>
                        <li>Passport to Advanced Math</li>
                        <li>Additional topics in math</li>
                      </ul>
                      
                      {activeQuizzes['sat-math'] && (
                        <Quiz 
                          questions={quizData.sat.math.questions}
                          sectionTitle="Math"
                          onComplete={(score, total) => handleQuizComplete("Math", score, total)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Digital SAT Format</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleQuiz('sat-digital-format')}
                        className="flex items-center gap-1"
                      >
                        {activeQuizzes['sat-digital-format'] ? 'Hide Quiz' : 'Take Quiz'}
                        {activeQuizzes['sat-digital-format'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p>Get familiar with the new digital SAT format and adaptive testing.</p>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      <li>Navigating the digital interface</li>
                      <li>Understanding module-based adaptive testing</li>
                      <li>Digital tools and features</li>
                      <li>Practice with simulated digital experience</li>
                    </ul>
                    
                    {activeQuizzes['sat-digital-format'] && (
                      <Quiz 
                        questions={quizData.sat.digitalFormat.questions}
                        sectionTitle="Digital SAT Format"
                        onComplete={(score, total) => handleQuizComplete("Digital SAT Format", score, total)}
                      />
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Practice Tests</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleQuiz('sat-practice')}
                          className="flex items-center gap-1"
                        >
                          {activeQuizzes['sat-practice'] ? 'Hide Quiz' : 'Take Quiz'}
                          {activeQuizzes['sat-practice'] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p>Take full-length practice tests with detailed score reports.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Official College Board practice tests</li>
                        <li>Timed test-taking practice</li>
                        <li>Detailed scoring and analysis</li>
                      </ul>
                      
                      {activeQuizzes['sat-practice'] && (
                        <Quiz 
                          questions={quizData.sat.practiceTests.questions}
                          sectionTitle="Practice Tests"
                          onComplete={(score, total) => handleQuizComplete("Practice Tests", score, total)}
                        />
                      )}
                    </div>
                    
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TestPrep;
