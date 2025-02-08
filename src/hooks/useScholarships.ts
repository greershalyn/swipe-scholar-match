
import { useQuery } from '@tanstack/react-query';
import { fetchScholarships } from '../utils/scholarshipUtils';

export const useScholarships = () => {
  return useQuery({
    queryKey: ['scholarships'],
    queryFn: fetchScholarships,
  });
};
