
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchScholarships } from '@/utils/scholarshipUtils';
import { Scholarship } from '@/types/scholarship';

interface ScholarshipPage {
  scholarships: Scholarship[];
  nextPage: number | undefined;
}

export function useScholarships() {
  return useInfiniteQuery<ScholarshipPage, Error>({
    queryKey: ['scholarships'],
    queryFn: async ({ pageParam }) => {
      const scholarships = await fetchScholarships(Number(pageParam ?? 1));
      return {
        scholarships,
        nextPage: scholarships.length > 0 ? Number(pageParam ?? 1) + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
