
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface KeywordsSectionProps {
  selectedKeywords: string[];
  setFormData: (data: any) => void;
}

export const KeywordsSection = ({ selectedKeywords, setFormData }: KeywordsSectionProps) => {
  const availableKeywords = [
    "STEM",
    "Arts",
    "Humanities",
    "Research",
    "Leadership",
    "Community Service",
    "Athletics",
    "Entrepreneurship",
    "Technology",
    "Healthcare",
    "Environmental",
    "Social Justice",
    "International",
    "First-Generation",
    "Women in STEM",
    "Minority",
    "Rural Background",
    "Urban Background",
    "Sustainability",
    "Innovation"
  ];

  const handleKeywordChange = (keyword: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      keywords: checked 
        ? [...(prev.keywords || []), keyword]
        : (prev.keywords || []).filter((k: string) => k !== keyword)
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Keywords</Label>
        <p className="text-sm text-muted-foreground">
          Select keywords that best describe you and your interests to help us find relevant scholarships.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {availableKeywords.map((keyword) => (
          <div key={keyword} className="flex items-center space-x-2">
            <Checkbox
              id={`keyword-${keyword}`}
              checked={selectedKeywords.includes(keyword)}
              onCheckedChange={(checked) => handleKeywordChange(keyword, checked === true)}
            />
            <Label
              htmlFor={`keyword-${keyword}`}
              className="text-sm font-normal cursor-pointer"
            >
              {keyword}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
