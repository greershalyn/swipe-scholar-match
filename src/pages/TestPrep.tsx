
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileSpreadsheet, GraduationCap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AccountDropdown } from '@/components/AccountDropdown';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { PremiumAccessPrompt } from '@/components/essay/PremiumAccessPrompt';

const TestPrep = () => {
  const { hasPremiumAccess, isCheckingAccess } = useSubscriptionCheck();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = React.useState(false);

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
                      <h3 className="text-lg font-semibold mb-2">English Section</h3>
                      <p>Master grammar, punctuation, and rhetoric with our comprehensive guides.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Grammar rules review</li>
                        <li>Punctuation practice</li>
                        <li>Sentence structure analysis</li>
                      </ul>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Math Section</h3>
                      <p>Review key algebra, geometry, and trigonometry concepts.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Algebra & functions</li>
                        <li>Geometry & trigonometry</li>
                        <li>Statistics & probability</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Reading Section</h3>
                      <p>Develop critical reading and comprehension skills for various text types.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Literary narrative analysis</li>
                        <li>Social science passage strategies</li>
                        <li>Humanities & natural science reading</li>
                      </ul>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Science Section</h3>
                      <p>Learn to interpret data, graphs, and scientific information quickly.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Data representation</li>
                        <li>Research summaries</li>
                        <li>Conflicting viewpoints</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-2">Writing Section (Optional)</h3>
                    <p>Develop essay-writing skills for the optional ACT Writing Test.</p>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      <li>Essay structure & planning</li>
                      <li>Developing arguments</li>
                      <li>Practice prompts with feedback</li>
                    </ul>
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
                      <h3 className="text-lg font-semibold mb-2">Reading & Writing</h3>
                      <p>Strengthen your verbal reasoning and comprehension skills.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Information & ideas</li>
                        <li>Craft & structure analysis</li>
                        <li>Expression of ideas</li>
                        <li>Standard English conventions</li>
                      </ul>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Math</h3>
                      <p>Master problem-solving and data analysis techniques.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Heart of Algebra</li>
                        <li>Problem solving & data analysis</li>
                        <li>Passport to Advanced Math</li>
                        <li>Additional topics in math</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-2">Digital SAT Format</h3>
                    <p>Get familiar with the new digital SAT format and adaptive testing.</p>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      <li>Navigating the digital interface</li>
                      <li>Understanding module-based adaptive testing</li>
                      <li>Digital tools and features</li>
                      <li>Practice with simulated digital experience</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="border p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Practice Tests</h3>
                      <p>Take full-length practice tests with detailed score reports.</p>
                      <ul className="list-disc list-inside mt-2 text-gray-700">
                        <li>Official College Board practice tests</li>
                        <li>Timed test-taking practice</li>
                        <li>Detailed scoring and analysis</li>
                      </ul>
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
