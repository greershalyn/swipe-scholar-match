
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { EssaySuggestion } from "@/types/essay";

interface EssaySuggestionsProps {
  suggestions: EssaySuggestion[];
}

export const EssaySuggestions = ({ suggestions }: EssaySuggestionsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold mb-4">Essay Approaches</h3>
      <div className="space-y-6">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
