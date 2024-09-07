import { useInfiniteQuery } from '@tanstack/react-query';

import { pFetch } from '../../utils';

export default function useItems() {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['items'],
    queryFn: async (ctx) => {
      const response = await pFetch('/inventory?cursor=number?', {
        method: 'GET',
        query: typeof ctx.pageParam === 'number' ? {
          cursor: ctx.pageParam
        } : {},
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    },
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined as undefined | number,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  return {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  };
}