
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
import { AchievementsSection } from "@/components/questionnaire/AchievementsSection";

const Questionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
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
    rewards_achievements: [] as string[],
    volunteering_experience: [] as string[],
    organizations: [] as string[],
  });

  useEffect(() => {
    checkUser();
    loadProfileData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          ...formData,
          ...data,
          gpa: data.gpa?.toString() ?? "",
          sat_score: data.sat_score?.toString() ?? "",
          act_score: data.act_score?.toString() ?? "",
          household_income: data.household_income?.toString() ?? "",
          rewards_achievements: data.rewards_achievements || [],
          volunteering_experience: data.volunteering_experience || [],
          organizations: data.organizations || [],
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Update Your Profile</CardTitle>
          <CardDescription>
            Update your profile information to help us match you with the best scholarships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PersonalInfoSection 
              formData={formData} 
              handleInputChange={handleInputChange}
              setFormData={setFormData}
            />
            <AcademicInfoSection formData={formData} handleInputChange={handleInputChange} />
            <BackgroundInfoSection formData={formData} setFormData={setFormData} />
            <PersonalStatementSection formData={formData} handleInputChange={handleInputChange} />
            <AchievementsSection formData={formData} setFormData={setFormData} />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="w-full">
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Questionnaire;
