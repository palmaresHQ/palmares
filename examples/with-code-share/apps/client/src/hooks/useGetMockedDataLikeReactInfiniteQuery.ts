import type { InfiniteData } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react'

export default function useGetMockedDataLikeReactInfiniteQuery<TData extends { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[]; 
  nextCursor: null | undefined | number | string
}>(getData: (nextCursor?: null | undefined | number | string) => TData, totalNumberOfItems?: number) {
  const [isFetchingNextPage, _setIsFetchingNextPage] = useState(false);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const setIsFetchingNextPage = (value: boolean) => {
    isFetchingNextPageRef.current = value;
    _setIsFetchingNextPage(value);
  }
  const [hasNextPage, setHasNextPage] = useState(true);
  const [status, setStatus] = useState('pending');
  const [calls, setCalls] = useState(0);
  const [data, setData] = useState<InfiniteData<{
    data: TData['rows'],
    nextCursor: TData['nextCursor']
  }> | undefined>({
    pages: [],
    pageParams: [],
  })

  async function getDataLikeFetch(nextCursor?: TData['nextCursor']) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getData(nextCursor);
  }

  function getInfiniteData(nextCursor?: TData['nextCursor']) {
    if (typeof totalNumberOfItems === 'number' && calls >= totalNumberOfItems) {
      setHasNextPage(false);
      return 
    };
    if (isFetchingNextPageRef.current) return;
    setStatus('loading');
    setIsFetchingNextPage(true);
    getDataLikeFetch(nextCursor).then((data) => {
      setData((prevData) => ({
        pages: [
          ...(prevData?.pages || []),
          {
            data: data.rows,
            nextCursor: data.nextCursor,
          },
        ],
        pageParams: [
          ...(prevData?.pageParams || []),
          data.nextCursor,
        ],
      }) as InfiniteData<{
        data: TData['rows'],
        nextCursor: TData['nextCursor']
      }>);
      setCalls((prev) => prev + 1);
      setStatus('success');
      setIsFetchingNextPage(false);
    })
  }

  useEffect(() => {
    getInfiniteData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
    return {
      data,
      hasNextPage,
      fetchNextPage: () => {
        getInfiniteData(data?.pageParams[data?.pageParams.length - 1] as TData['nextCursor'])
      },
      isFetchingNextPage,
      status: status,
    };
  }