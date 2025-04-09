
import { Card, CardContent } from "@/components/ui/card";
import { ExpandedFramework } from "@/types/essay";

interface ExpandedFrameworkViewProps {
  framework: ExpandedFramework;
}

export const ExpandedFrameworkView = ({ framework }: ExpandedFrameworkViewProps) => {
  return (
    <Card className="bg-purple-50">
      <CardContent className="pt-4 max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">{framework.title}</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-purple-700 mb-1 text-sm">Opening Hook:</h4>
            <p className="text-xs">{framework.hook}</p>
          </div>

          <div className="space-y-3">
            {framework.talkingPoints.map((section, index) => (
              <div key={index}>
                <h4 className="font-medium text-purple-700 mb-1 text-sm">{section.title}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="text-xs">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-medium text-purple-700 mb-1 text-sm">Connecting to Your Future:</h4>
            <p className="text-xs">{framework.conclusion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
