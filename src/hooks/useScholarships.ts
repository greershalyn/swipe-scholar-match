
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
        console.log('Fetching scholarships page:', pageParam);
        // Add timestamp to ensure we get fresh data on refresh
        const data = await fetchScholarships(pageParam as number, Date.now());
        console.log('Received scholarships data:', data);
        // If we got less than 10 scholarships, there are no more pages
        const hasMorePages = data && data.length === 10;
        return {
          scholarships: data || [],
          nextPage: hasMorePages ? (pageParam as number) + 1 : undefined,
        };
      } catch (error) {
        console.error('Error in useScholarships:', error);
        throw error; // Let the error boundary handle it
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Clear cache immediately
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    initialPageParam: 1,
  });
};
