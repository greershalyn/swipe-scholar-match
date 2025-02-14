
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '@/utils/scholarshipUtils';
import { Scholarship } from '@/types/scholarship';

interface ScholarshipPage {
  scholarships: Scholarship[];
  nextPage: number | undefined;
}

export function useScholarships() {
  return useInfiniteQuery<ScholarshipPage>({
    queryKey: ['scholarships'],
    queryFn: async ({ pageParam = 1 }) => {
      const scholarships = await fetchScholarships(Number(pageParam));
      return {
        scholarships,
        nextPage: scholarships.length === 10 ? Number(pageParam) + 1 : undefined
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    retry: 1, // Only retry once to avoid excessive API calls
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}
