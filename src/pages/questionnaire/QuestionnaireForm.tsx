
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PersonalInfoSection } from "@/components/questionnaire/PersonalInfoSection";
import { AcademicInfoSection } from "@/components/questionnaire/AcademicInfoSection";
import { BackgroundInfoSection } from "@/components/questionnaire/BackgroundInfoSection";
import { PersonalStatementSection } from "@/components/questionnaire/PersonalStatementSection";
import { AchievementsSection } from "@/components/questionnaire/AchievementsSection";
import { KeywordsSection } from "@/components/questionnaire/KeywordsSection";
import { useQuestionnaireForm } from "./useQuestionnaireForm";

export const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const { formData, loading, handleInputChange, handleSubmit } = useQuestionnaireForm();

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection 
        formData={formData} 
        handleInputChange={handleInputChange}
        setFormData={setFormData}
      />
      <AcademicInfoSection 
        formData={formData} 
        handleInputChange={handleInputChange} 
        setFormData={setFormData}
      />
      <BackgroundInfoSection formData={formData} setFormData={setFormData} />
      <PersonalStatementSection formData={formData} handleInputChange={handleInputChange} />
      <AchievementsSection formData={formData} setFormData={setFormData} />
      <KeywordsSection
        selectedKeywords={formData.keywords}
        setFormData={setFormData}
      />

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => navigate("/")} className="w-full">
          Cancel
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
