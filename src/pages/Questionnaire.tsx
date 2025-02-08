
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Questionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    ethnicity: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    gpa: "",
    sat_score: "",
    act_score: "",
    current_education_level: "",
    intended_major: "",
    financial_need: false,
    household_income: "",
    first_generation_student: false,
    military_affiliation: "",
    disability_status: false,
    essay_personal_statement: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No user session found");

      // Convert string values to appropriate types before sending to Supabase
      const formattedData = {
        ...formData,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        sat_score: formData.sat_score ? parseInt(formData.sat_score) : null,
        act_score: formData.act_score ? parseInt(formData.act_score) : null,
        household_income: formData.household_income ? parseFloat(formData.household_income) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(formattedData)
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Scholarship Profile Questionnaire</CardTitle>
          <CardDescription>
            Help us match you with the best scholarships by completing your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label>First Generation Student</Label>
                <RadioGroup
                  name="first_generation_student"
                  value={formData.first_generation_student.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Questionnaire;
