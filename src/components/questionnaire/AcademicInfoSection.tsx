
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    college_university: string;
    dual_enrollment: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const AcademicInfoSection = ({
  formData,
  handleInputChange,
  setFormData,
}: AcademicInfoProps) => {
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

  const handleDualEnrollmentChange = (checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      dual_enrollment: checked,
    }));
  };

  const handleGraduationStatusChange = (checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      high_school_graduated: checked,
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
        <Label htmlFor="college_university">College/University</Label>
        <Input
          id="college_university"
          name="college_university"
          value={formData.college_university}
          onChange={handleInputChange}
          placeholder="Enter your college or university"
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

      <div className="space-y-2 col-span-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="high_school_graduated" className="cursor-pointer">
            I have graduated high school
          </Label>
          <Switch
            id="high_school_graduated"
            checked={formData.high_school_graduated}
            onCheckedChange={handleGraduationStatusChange}
          />
        </div>
      </div>

      <div className="space-y-2 col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dual_enrollment" className="cursor-pointer">
              Dual Enrollment Student
            </Label>
            <p className="text-sm text-muted-foreground">
              I am taking or plan to take college classes while in high school
            </p>
          </div>
          <Switch
            id="dual_enrollment"
            checked={formData.dual_enrollment}
            onCheckedChange={handleDualEnrollmentChange}
          />
        </div>
      </div>
    </div>
  );
};
