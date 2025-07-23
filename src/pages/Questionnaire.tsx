
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionnaireForm } from "./questionnaire/QuestionnaireForm";
import { useIsMobile } from '@/hooks/use-mobile';

const Questionnaire = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'p-2' : 'p-4'}`}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader className={isMobile ? 'p-4' : ''}>
          <CardTitle className={isMobile ? 'text-xl' : ''}>Update Your Profile</CardTitle>
          <CardDescription className={isMobile ? 'text-sm' : ''}>
            Update your profile information to help us match you with the best scholarships
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4' : ''}>
          <QuestionnaireForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Questionnaire;
