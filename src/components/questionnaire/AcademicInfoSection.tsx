
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AcademicInfoProps {
  formData: {
    gpa: string;
    sat_score: string;
    act_score: string;
    current_education_level: string;
    intended_major: string;
    high_school_graduated: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const AcademicInfoSection = ({ formData, handleInputChange, setFormData }: AcademicInfoProps) => {
  const educationLevels = [
    "9th Grade",
    "10th Grade",
    "11th Grade",
    "12th Grade",
    "Freshman (College)",
    "Sophomore (College)",
    "Junior (College)",
    "Senior (College)",
    "Graduate Student",
  ];

  const handleEducationLevelChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      current_education_level: value,
    }));
  };

  const handleGraduationStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      high_school_graduated: e.target.checked,
    }));
  };

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
        <Select 
          value={formData.current_education_level} 
          onValueChange={handleEducationLevelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your education level" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 z-50">
            {educationLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <div className="space-y-2 flex items-center">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="high_school_graduated"
            checked={formData.high_school_graduated}
            onChange={handleGraduationStatusChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="high_school_graduated">
            I have graduated high school
          </Label>
        </div>
      </div>
    </div>
  );
};

