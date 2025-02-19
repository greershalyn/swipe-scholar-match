
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface DocumentReviewError {
  sentence: string;
  error: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export const DocumentReviewTool = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [reviewResults, setReviewResults] = useState<DocumentReviewError[]>([]);

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
          {isAnalyzing ? "Analyzing..." : "Analyze Essay"}
        </Button>
      </div>

      {reviewResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review Results</h3>
          {reviewResults.map((result, index) => (
            <Card key={index} className="border-l-4 border-l-yellow-400">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <p className="font-medium">{result.error}</p>
                    <p className="text-sm text-gray-600">{result.sentence}</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
