
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AcademicInfoProps {
  formData: {
    gpa: string;
    sat_score: string;
    act_score: string;
    current_education_level: string;
    intended_major: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AcademicInfoSection = ({ formData, handleInputChange }: AcademicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="gpa">GPA</Label>
        <Input
          id="gpa"
          name="gpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
          value={formData.gpa}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sat_score">SAT Score</Label>
        <Input
          id="sat_score"
          name="sat_score"
          type="number"
          value={formData.sat_score}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="act_score">ACT Score</Label>
        <Input
          id="act_score"
          name="act_score"
          type="number"
          value={formData.act_score}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_education_level">Current Education Level</Label>
        <Input
          id="current_education_level"
          name="current_education_level"
          value={formData.current_education_level}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="intended_major">Intended Major</Label>
        <Input
          id="intended_major"
          name="intended_major"
          value={formData.intended_major}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
  );
};
