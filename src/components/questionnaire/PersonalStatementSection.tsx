
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PersonalStatementProps {
  formData: {
    essay_personal_statement: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const PersonalStatementSection = ({ formData, handleInputChange }: PersonalStatementProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="essay_personal_statement">Personal Statement</Label>
      <Textarea
        id="essay_personal_statement"
        name="essay_personal_statement"
        value={formData.essay_personal_statement}
        onChange={handleInputChange}
        className="h-32"
        placeholder="Tell us about yourself, your goals, and why you deserve scholarship opportunities..."
        required
      />
    </div>
  );
};
