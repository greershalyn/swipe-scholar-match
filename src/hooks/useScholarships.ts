
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '../utils/scholarshipUtils';
import { Scholarship } from '../types/scholarship';

export const useScholarships = () => {
  return useInfiniteQuery({
    queryKey: ['scholarships'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const data = await fetchScholarships(pageParam);
        console.log('Fetched scholarships:', data);
        return {
          scholarships: data || [],
          nextPage: data.length === 5 ? pageParam + 1 : undefined,
        };
      } catch (error) {
        console.error('Error in useScholarships:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageSize: 5,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
