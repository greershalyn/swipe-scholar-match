
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '@/utils/scholarshipUtils';
import { Scholarship } from '@/types/scholarship';

interface ScholarshipPage {
  scholarships: Scholarship[];
  nextPage: number | undefined;
}

export function useScholarships(timestamp: number = Date.now()) {
  return useInfiniteQuery<ScholarshipPage>({
    queryKey: ['scholarships', timestamp],
    queryFn: async ({ pageParam = 1 }) => {
      const scholarships = await fetchScholarships(Number(pageParam), timestamp);
      return {
        scholarships,
        nextPage: scholarships.length === 10 ? Number(pageParam) + 1 : undefined
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Clear cache immediately
    refetchOnMount: true // Refetch when component mounts
  });
}
