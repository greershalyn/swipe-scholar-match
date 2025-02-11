
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionnaireForm } from "./questionnaire/QuestionnaireForm";

const Questionnaire = () => {
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
          <QuestionnaireForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Questionnaire;
