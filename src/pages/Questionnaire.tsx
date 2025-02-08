
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonalInfoSection } from "@/components/questionnaire/PersonalInfoSection";
import { AcademicInfoSection } from "@/components/questionnaire/AcademicInfoSection";
import { BackgroundInfoSection } from "@/components/questionnaire/BackgroundInfoSection";
import { PersonalStatementSection } from "@/components/questionnaire/PersonalStatementSection";

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
    const { name, value } = e.target;
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
            <PersonalInfoSection formData={formData} handleInputChange={handleInputChange} />
            <AcademicInfoSection formData={formData} handleInputChange={handleInputChange} />
            <BackgroundInfoSection formData={formData} setFormData={setFormData} />
            <PersonalStatementSection formData={formData} handleInputChange={handleInputChange} />

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
