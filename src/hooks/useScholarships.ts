
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '../utils/scholarshipUtils';
import { Scholarship } from '../types/scholarship';

interface ScholarshipPage {
  scholarships: Scholarship[];
  nextPage: number | undefined;
}

export const useScholarships = () => {
  return useInfiniteQuery<ScholarshipPage>({
    queryKey: ['scholarships'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const data = await fetchScholarships(pageParam as number);
        return {
          scholarships: data || [],
          nextPage: data.length === 5 ? (pageParam as number) + 1 : undefined,
        };
      } catch (error) {
        console.error('Error in useScholarships:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};
