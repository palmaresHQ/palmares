import { useInfiniteQuery } from "@tanstack/react-query";
import { pFetch } from "../../utils";
import { useState } from "react";
import useDebounce from "../useDebounce";

export default function useUsers() {
  const debounce = useDebounce(300);
  const [search, setSearch] = useState<string>('');

  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['users', search],
    queryFn: async (ctx) => {
      const query = typeof ctx.pageParam === 'number' && search.length > 0 ? {
        cursor: ctx.pageParam,
        search: search
      } : typeof ctx.pageParam === 'number' ? {
        cursor: ctx.pageParam
      } : search.length > 0 ? {
        search: search
      } : {};
      
      const response = await pFetch('/users?cursor=number?&search=string?', {
        method: 'GET',
        query: query,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined as undefined | number,
  });
  
  return {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    onSearch: (search: string) => debounce(() => setSearch(search)),
  };
}