
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EssaySuggestion, ExpandedFramework } from "@/types/essay";
import { generateExpandedFramework } from "@/utils/essay/frameworkGenerator";
import { useState } from "react";

interface EssaySuggestionsProps {
  suggestions: EssaySuggestion[];
  essayTopic: string;
  personalResponse: string;
}

export const EssaySuggestions = ({ suggestions, essayTopic, personalResponse }: EssaySuggestionsProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [expandedFramework, setExpandedFramework] = useState<ExpandedFramework | null>(null);

  const handleSuggestionSelect = async (index: number) => {
    setSelectedSuggestion(index);
    try {
      const framework = await generateExpandedFramework(suggestions[index], essayTopic, personalResponse);
      setExpandedFramework(framework);
    } catch (error) {
      console.error('Error generating framework:', error);
      // You might want to show a toast or error message here
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold mb-4">Essay Approaches</h3>
      <div className="space-y-6">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow ${selectedSuggestion === index ? 'ring-2 ring-purple-500' : ''}`}
          >
            <CardContent className="pt-6">
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                {suggestion.title}
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opening Hook:</p>
                  <p className="text-sm">{suggestion.hook}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Essay Framework:</p>
                  <p className="text-sm">{suggestion.framework}</p>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full mt-4"
                  onClick={() => handleSuggestionSelect(index)}
                >
                  Select This Approach
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expandedFramework && (
        <Card className="mt-8 bg-purple-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">{expandedFramework.title}</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Opening Hook:</h4>
                <p className="text-sm">{expandedFramework.hook}</p>
              </div>

              <div className="space-y-4">
                {expandedFramework.talkingPoints.map((section, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-purple-700 mb-2">{section.title}</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {section.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-sm">{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-medium text-purple-700 mb-2">Connecting to Your Future:</h4>
                <p className="text-sm">{expandedFramework.conclusion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
