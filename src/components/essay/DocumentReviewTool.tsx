
import React, { useState } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
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
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResults, setReviewResults] = useState<DocumentReviewError[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const mimeType = file.type;
    if (!mimeType.includes('pdf') && !mimeType.includes('word') && !mimeType.includes('document')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setReviewResults([]);

      // Upload file to Supabase storage
      const fileName = `${crypto.randomUUID()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('essay-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setIsAnalyzing(true);

      // Call the review function
      const { data: reviewData, error: reviewError } = await supabase.functions
        .invoke('review-essay-document', {
          body: { 
            filePath: uploadData.path,
            mimeType: mimeType
          }
        });

      if (reviewError) {
        throw new Error(reviewError.message);
      }

      if (!reviewData?.results) {
        throw new Error('No review results received');
      }

      setReviewResults(reviewData.results);
      toast({
        title: "Document Analyzed",
        description: `Found ${reviewData.results.length} suggestions for improvement.`,
      });
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error Processing Document",
        description: error.message || "There was an error analyzing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={isUploading || isAnalyzing}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <span className="text-sm font-medium text-gray-600">
            {isUploading ? "Uploading..." : 
             isAnalyzing ? "Analyzing..." :
             "Upload your essay (PDF or Word)"}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Click or drag and drop
          </span>
        </label>
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
