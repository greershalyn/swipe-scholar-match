
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResourcesTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle>Online Resources for First-Generation Students</CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://firstgen.naspa.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                Center for First-generation Student Success
              </a>
              <p className="text-sm text-gray-600">
                Comprehensive resources and research for first-generation college students
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://www.imfirst.org/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                I'm First
              </a>
              <p className="text-sm text-gray-600">
                Virtual community for first-generation college students
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <a href="https://www.collegepoint.info/" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-600 hover:underline">
                CollegePoint
              </a>
              <p className="text-sm text-gray-600">
                Free virtual advising for high-achieving, low and moderate-income students
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export default ResourcesTab;
