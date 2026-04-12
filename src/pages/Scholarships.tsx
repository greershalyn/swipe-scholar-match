import ScholarshipSwiper from '@/components/ScholarshipSwiper';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { GraduationCap } from 'lucide-react';

export default function Scholarships() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <GradientIcon icon={GraduationCap} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scholarships</h1>
          <p className="text-sm text-muted-foreground">Swipe right to save, left to skip</p>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <ScholarshipSwiper />
        </div>
      </div>
    </div>
  );
}
