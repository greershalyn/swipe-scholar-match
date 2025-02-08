
import { Scholarship } from '../../types/scholarship';

export const mockScholarships: Scholarship[] = [
  {
    id: 'mock-1',
    title: 'STEM Excellence Scholarship',
    amount: 5000,
    deadline: '2024-12-31',
    category: 'STEM',
    description: 'For outstanding students pursuing degrees in Science, Technology, Engineering, or Mathematics.',
    requirements: [
      'Minimum 3.5 GPA',
      'Pursuing STEM degree',
      'Full-time enrollment',
      'US citizen or permanent resident'
    ],
    provider: 'Future Tech Foundation',
    url: 'https://example.com/stem-scholarship',
    match_score: 95
  },
  {
    id: 'mock-2',
    title: 'First Generation Student Award',
    amount: 3000,
    deadline: '2024-11-30',
    category: 'First Generation',
    description: 'Supporting first-generation college students in their academic journey.',
    requirements: [
      'First-generation college student',
      'Minimum 3.0 GPA',
      'Demonstrated financial need',
      'Community involvement'
    ],
    provider: 'Education Access Foundation',
    url: 'https://example.com/firstgen-scholarship',
    match_score: 88
  },
  {
    id: 'mock-3',
    title: 'Creative Arts Grant',
    amount: 2500,
    deadline: '2024-10-15',
    category: 'Arts',
    description: 'Supporting talented students in visual arts, music, theater, or creative writing.',
    requirements: [
      'Portfolio submission',
      'Arts major or minor',
      'Letter of recommendation',
      'Essay submission'
    ],
    provider: 'Arts Alliance',
    url: 'https://example.com/arts-grant',
    match_score: 75
  }
];

