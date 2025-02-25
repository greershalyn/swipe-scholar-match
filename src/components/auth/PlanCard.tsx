
import { Crown, Star, Lightbulb, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlanCardProps {
  type: "free" | "premium";
  isSelected: boolean;
  onClick: () => void;
}

export const PlanCard = ({ type, isSelected, onClick }: PlanCardProps) => {
  const isFree = type === "free";

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{isFree ? "Free Plan" : "Premium Plan"}</h3>
          <span className="text-lg font-bold">{isFree ? "$0" : "$10/month"}</span>
        </div>
        {isFree ? (
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Access to scholarship database
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-500" />
              Basic profile customization
            </li>
          </ul>
        ) : (
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Everything in Free plan
            </li>
            <li className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              AI Essay Assistant
            </li>
            <li className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-yellow-500" />
              Professional writing feedback
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
