
import { Card, CardContent } from "@/components/ui/card";
import { ExpandedFramework } from "@/types/essay";

interface ExpandedFrameworkViewProps {
  framework: ExpandedFramework;
}

export const ExpandedFrameworkView = ({ framework }: ExpandedFrameworkViewProps) => {
  return (
    <Card className="bg-purple-50">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4">{framework.title}</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-purple-700 mb-2">Opening Hook:</h4>
            <p className="text-sm">{framework.hook}</p>
          </div>

          <div className="space-y-4">
            {framework.talkingPoints.map((section, index) => (
              <div key={index}>
                <h4 className="font-medium text-purple-700 mb-2">{section.title}</h4>
                <ul className="list-disc list-inside space-y-2">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-sm">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-medium text-purple-700 mb-2">Connecting to Your Future:</h4>
            <p className="text-sm">{framework.conclusion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
