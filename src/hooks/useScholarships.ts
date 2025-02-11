
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
        // If we got less than 5 scholarships, there are no more pages
        const hasMorePages = data && data.length === 5;
        return {
          scholarships: data || [],
          nextPage: hasMorePages ? (pageParam as number) + 1 : undefined,
        };
      } catch (error) {
        console.error('Error in useScholarships:', error);
        // Return empty data instead of throwing
        return {
          scholarships: [],
          nextPage: undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,
    retry: 1, // Reduce retries to avoid too many failed attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    initialPageParam: 1,
  });
};
