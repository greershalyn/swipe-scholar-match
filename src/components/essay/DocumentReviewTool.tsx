
import React, { useState } from 'react';
import { AlertCircle, BookOpen, Brain, Lightbulb, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface DocumentReviewError {
  sentence: string;
  error: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
  type: 'enhancement' | 'structure' | 'technical' | 'clarity' | 'impact';
}

export const DocumentReviewTool = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [reviewResults, setReviewResults] = useState<DocumentReviewError[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const handleAnalyzeEssay = async () => {
    if (!essayText.trim()) {
      toast({
        title: "Essay Required",
        description: "Please enter your essay text before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setReviewResults([]);

    try {
      console.log('Starting essay analysis...');
      const { data: reviewData, error: reviewError } = await supabase.functions
        .invoke('review-essay-document', {
          body: { text: essayText }
        });

      if (reviewError) {
        console.error('Review error:', reviewError);
        throw new Error(reviewError.message);
      }

      if (!reviewData?.results) {
        throw new Error('No review results received');
      }

      console.log('Analysis complete:', reviewData.results.length, 'issues found');
      setReviewResults(reviewData.results);
      toast({
        title: "Essay Analyzed",
        description: `Found ${reviewData.results.length} suggestions for improvement.`,
      });
    } catch (error) {
      console.error('Essay analysis error:', error);
      toast({
        title: "Error Analyzing Essay",
        description: error.message || "There was an error analyzing your essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Updated filtering logic to check the error field prefix
  const filteredResults = activeTab === 'all' 
    ? reviewResults 
    : reviewResults.filter(result => {
        const errorPrefix = result.error.split(':')[0].toLowerCase();
        const tabType = activeTab.toLowerCase();
        
        // Map error prefixes to tab types
        switch (errorPrefix) {
          case 'impact':
            return tabType === 'impact';
          case 'structure':
            return tabType === 'structure';
          case 'technical':
            return tabType === 'technical';
          case 'clarity':
            return tabType === 'clarity';
          case 'logic':
            return tabType === 'enhancement';
          default:
            return tabType === 'enhancement';
        }
      });

  const getIcon = (type: string) => {
    // Extract the category from the error field
    const category = type.split(':')[0].toLowerCase();
    
    switch (category) {
      case 'impact':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'structure':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'technical':
        return <Check className="h-5 w-5 text-red-500" />;
      case 'clarity':
        return <Brain className="h-5 w-5 text-green-500" />;
      case 'logic':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="essay-text">Paste your essay here</Label>
        <Textarea
          id="essay-text"
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Enter your essay text for review..."
          className="min-h-[200px] w-full p-4"
        />
        <Button 
          onClick={handleAnalyzeEssay}
          disabled={isAnalyzing || !essayText.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Analyzing...</span>
            </div>
          ) : (
            "Analyze Essay"
          )}
        </Button>
      </div>

      {reviewResults.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Teacher's Feedback</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="clarity">Clarity</TabsTrigger>
              <TabsTrigger value="enhancement">Logic</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-400">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        {getIcon(result.error)}
                        <div className="space-y-2">
                          <p className="font-medium">{result.error}</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            "{result.sentence}"
                          </p>
                          <div className="text-sm text-gray-700 space-y-2">
                            {result.explanation.split('\n').map((line, i) => (
                              <p key={i} className="leading-relaxed">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
