
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface AchievementsSectionProps {
  formData: {
    rewards_achievements: string[];
    volunteering_experience: string[];
    organizations: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const AchievementsSection = ({ formData, setFormData }: AchievementsSectionProps) => {
  const handleArrayItemChange = (
    field: 'rewards_achievements' | 'volunteering_experience' | 'organizations',
    index: number,
    value: string
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => 
        i === index ? value : item
      ),
    }));
  };

  const handleAddItem = (
    field: 'rewards_achievements' | 'volunteering_experience' | 'organizations'
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveItem = (
    field: 'rewards_achievements' | 'volunteering_experience' | 'organizations',
    index: number
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index),
    }));
  };

  const renderArrayField = (
    field: 'rewards_achievements' | 'volunteering_experience' | 'organizations',
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {formData[field].map((item: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleArrayItemChange(field, index, e.target.value)}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveItem(field, index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleAddItem(field)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {label}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderArrayField(
        'rewards_achievements',
        'Rewards & Achievements',
        'Enter an achievement...'
      )}
      {renderArrayField(
        'volunteering_experience',
        'Volunteering Experience',
        'Enter volunteering experience...'
      )}
      {renderArrayField(
        'organizations',
        'Organizations',
        'Enter organization name...'
      )}
    </div>
  );
};
