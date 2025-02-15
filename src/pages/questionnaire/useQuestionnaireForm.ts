
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useQuestionnaireForm = () => {
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
    high_school_graduated: false,
    keywords: [] as string[],
    college_university: "",
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
          // Safely convert numeric values to strings, handling null/undefined cases
          gpa: data.gpa != null ? data.gpa.toString() : "",
          sat_score: data.sat_score != null ? data.sat_score.toString() : "",
          act_score: data.act_score != null ? data.act_score.toString() : "",
          household_income: data.household_income != null ? data.household_income.toString() : "",
          // Ensure arrays are initialized even if null/undefined
          rewards_achievements: data.rewards_achievements || [],
          volunteering_experience: data.volunteering_experience || [],
          organizations: data.organizations || [],
          keywords: data.keywords || [],
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

  return {
    formData,
    setFormData,
    loading,
    handleInputChange,
    handleSubmit,
  };
};
