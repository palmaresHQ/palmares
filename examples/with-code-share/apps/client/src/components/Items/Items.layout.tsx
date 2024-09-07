import Item from "../Item/Item.component";
import { useVirtualList } from "../../hooks";
import { InfiniteData } from "@tanstack/react-query";
import { ArrayInventoryOutput } from "shared";
import { ComponentProps } from "react";

export default function ItemsLayout(props: {
  data?: InfiniteData<{
    data: ArrayInventoryOutput,
    nextCursor: number | null 
  }>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  error?: Error | null;
  status: string
  onRenderItem: (key: number, props: ComponentProps<typeof Item>) => JSX.Element;
}) {
  const { 
    parentRef,
    rowVirtualizer,
    allRows
  } = useVirtualList({
    data: props.data,
    fetchNextPage: props.fetchNextPage,
    hasNextPage: props.hasNextPage,
    isFetchingNextPage: props.isFetchingNextPage,
    estimatedSize: document.body.clientWidth > 767 ? 160 : 370
  })

  return (
    <div ref={parentRef} className="w-full h-full flex flex-col overflow-auto pr-3 pl-3">
      {props.status === 'pending' ? (
        <p>Loading...</p>
      ) : props.status === 'error' ? (
        <span>Error: {props.error?.message}</span>
      ) : (
        <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow = virtualRow.index > allRows.length - 1
            const item = allRows[virtualRow.index];
            return props.onRenderItem(virtualRow.index,{
              item,
              isLoaderRow,
              virtualRow,
              hasMore: props.hasNextPage
            })
          })}
        </div>
      )}
    </div>
  );
}