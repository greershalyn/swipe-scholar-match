
import { useQuery } from '@tanstack/react-query';
import { fetchScholarships } from '../utils/scholarshipUtils';
import { Scholarship } from '../types/scholarship';

export const useScholarships = () => {
  return useQuery<Scholarship[]>({
    queryKey: ['scholarships'],
    queryFn: fetchScholarships,
    onError: (error) => {
      console.error('Error fetching scholarships:', error);
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
