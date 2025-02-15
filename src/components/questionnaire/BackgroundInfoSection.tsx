
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BackgroundInfoProps {
  formData: {
    first_generation_student: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const BackgroundInfoSection = ({ formData, setFormData }: BackgroundInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>First Generation Student</Label>
        <RadioGroup
          name="first_generation_student"
          value={(formData.first_generation_student ?? false).toString()}
          onValueChange={(value) =>
            setFormData((prev: any) => ({
              ...prev,
              first_generation_student: value === "true",
            }))
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="first-gen-yes" />
            <Label htmlFor="first-gen-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="first-gen-no" />
            <Label htmlFor="first-gen-no">No</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
