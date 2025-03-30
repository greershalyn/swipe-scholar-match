
import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Scholarship {
  name: string;
  description: string;
  amount: string;
  eligibility: string;
  deadline: string;
  link: string;
}

const scholarships: Scholarship[] = [
  {
    name: "Colorado Mesa University's First Generation Scholarship",
    description: "Offered to incoming first-year students whose parents do not possess a bachelor's degree.",
    amount: "$1,000 per year",
    eligibility: "First-generation college students enrolling at Colorado Mesa University with minimum 3.0 GPA",
    deadline: "Varies",
    link: "https://www.coloradomesa.edu/financial-aid/",
  },
  {
    name: "Dorrance Scholarship Programs",
    description: "Designed for first-generation college students in Arizona, providing financial assistance, mentorship and enrichment opportunities.",
    amount: "$12,000 per year (up to four years)",
    eligibility: "Arizona residents who are first-generation students with minimum 3.0 GPA",
    deadline: "January",
    link: "https://dorrancescholarship.org/",
  },
  {
    name: "Florida First Generation Matching Grant Program",
    description: "A need-based grant program for students whose parents have not earned a bachelor's degree.",
    amount: "Varies",
    eligibility: "First-generation students enrolled in eligible Florida public institutions",
    deadline: "Varies by institution",
    link: "https://www.floridastudentfinancialaidsg.org/",
  },
  {
    name: "OCA-UPS Gold Mountain Scholarship",
    description: "Supports first-generation Asian American and Pacific Islander students pursuing higher education.",
    amount: "$2,000",
    eligibility: "High school seniors of Asian or Pacific Islander descent who are first in their family to attend college",
    deadline: "April",
    link: "https://www.ocanational.org/",
  },
  {
    name: "Odyssey Scholarships",
    description: "Provided by The University of Chicago, covering tuition and offering additional support services.",
    amount: "Varies",
    eligibility: "First-generation and/or low-income students admitted to The University of Chicago",
    deadline: "Varies",
    link: "https://collegeadmissions.uchicago.edu/odyssey-scholarship",
  },
];

const ScholarshipsTab = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader className="bg-slate-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6 text-purple-600" />
          First-Generation Student Scholarships
        </CardTitle>
        <CardDescription>
          Scholarships specifically for first-generation college students
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-slate-50 rounded-b-lg p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scholarship</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scholarships.map((scholarship) => (
                <TableRow key={scholarship.name}>
                  <TableCell>
                    <div className="font-medium">{scholarship.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{scholarship.description}</div>
                  </TableCell>
                  <TableCell>{scholarship.amount}</TableCell>
                  <TableCell>{scholarship.deadline}</TableCell>
                  <TableCell>
                    <a 
                      href={scholarship.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-purple-600 hover:text-purple-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Learn More
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ScholarshipsTab;
