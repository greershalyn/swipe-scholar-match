
import { useQuery } from '@tanstack/react-query';
import { fetchScholarships } from '../utils/scholarshipUtils';
import { Scholarship } from '../types/scholarship';

export const useScholarships = () => {
  return useQuery<Scholarship[]>({
    queryKey: ['scholarships'],
    queryFn: fetchScholarships,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
