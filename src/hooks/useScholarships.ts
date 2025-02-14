
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '@/utils/scholarshipUtils';
import { Scholarship } from '@/types/scholarship';

export function useScholarships() {
  return useInfiniteQuery({
    queryKey: ['scholarships'],
    queryFn: async ({ pageParam = 1 }) => {
      const scholarships = await fetchScholarships(pageParam);
      return {
        scholarships,
        nextPage: scholarships.length > 0 ? pageParam + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageSize: 10
  });
}
