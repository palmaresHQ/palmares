import { InfiniteData } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

export default function useVirtualList<TData extends InfiniteData<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  nextCursor: number | string | undefined | null
}> | undefined>(
  args: {
    data: TData;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    estimatedSize: number;
    overscan?: number;
  }
) {
  const allRows = args.data ? args.data.pages.flatMap((page) => page.data) : []

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: args.hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => args.estimatedSize,
    overscan: args.overscan ?? 5,
  });
 
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      args.hasNextPage &&
      !args.isFetchingNextPage
    ) {
      args.fetchNextPage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    args.hasNextPage,
    args.fetchNextPage,
    allRows.length,
    args.isFetchingNextPage,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    rowVirtualizer.getVirtualItems(),
  ]);
  
  return {
    parentRef,
    rowVirtualizer,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allRows: allRows as TData extends InfiniteData<{ data: infer TData; nextCursor: any }> ? TData : [],
  }
}