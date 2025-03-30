
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
    deadline: "February 5, 2025",
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
  {
    name: "NSHSS First Generation Scholarship",
    description: "Recognizes first-generation college students for their academic and leadership initiatives.",
    amount: "Varies",
    eligibility: "High school seniors who are the first in their families to attend a college or university",
    deadline: "Varies annually",
    link: "https://www.nshss.org/scholarships/",
  },
  {
    name: "TIAA First-Generation Scholarship Program",
    description: "Assists first-generation undergraduate students planning to continue their education in college.",
    amount: "Varies",
    eligibility: "First-generation college students enrolled or planning to enroll in an undergraduate program",
    deadline: "Varies annually",
    link: "https://www.tiaa.org/public/about-tiaa/corporate-social-responsibility/support-for-communities",
  },
  {
    name: "RSM US Foundation First Generation Scholarship",
    description: "Awards scholarships to first-generation students demonstrating financial need and academic excellence.",
    amount: "Up to $30,000, paid $10,000 annually over three consecutive academic years",
    eligibility: "First-generation college students enrolled full-time in an accredited institution",
    deadline: "December 1 to February 28 annually",
    link: "https://rsmus.com/who-we-are/corporate-responsibility/rsm-foundation.html",
  },
  {
    name: "University of Colorado Boulder First Generation Scholarship",
    description: "Provides financial assistance to first-generation and transfer students with significant financial need.",
    amount: "Varies",
    eligibility: "First-generation students enrolled at the University of Colorado Boulder demonstrating financial need",
    deadline: "Varies annually",
    link: "https://www.colorado.edu/scholarships/",
  },
  {
    name: "Bold.org First Generation Scholarships",
    description: "Offers a variety of scholarships specifically for first-generation students, with multiple opportunities available.",
    amount: "Varies by scholarship",
    eligibility: "First-generation college students; specific criteria vary by scholarship",
    deadline: "Multiple deadlines throughout the year",
    link: "https://bold.org/scholarships/first-generation-college-student-scholarships/",
  },
  {
    name: "Sallie Mae First-Generation College Student Scholarships",
    description: "Provides a list of scholarships available for first-generation students to help fund their education.",
    amount: "Varies by scholarship",
    eligibility: "First-generation college students; specific criteria vary by scholarship",
    deadline: "Multiple deadlines throughout the year",
    link: "https://www.salliemae.com/college-planning/",
  },
  {
    name: "Clarkston Scholars Program",
    description: "Supports highly-driven, low-income, first-generation college sophomores with an interest in consulting, consumer products, life sciences, or retail industries.",
    amount: "$10,000 ($5,000 per year for junior and senior year)",
    eligibility: "First-generation college sophomores enrolled full-time in a four-year accredited institution",
    deadline: "February 7, 2025",
    link: "https://clarkstonconsulting.com/clarkston-foundation/scholars-program/",
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
