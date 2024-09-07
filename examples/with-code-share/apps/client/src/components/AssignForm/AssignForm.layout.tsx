import Modal from "../Modal/Modal.component";
import { useVirtualList } from "../../hooks";
import { AbstractUser, InventoryInput, ModelFields } from "shared";
import { InfiniteData } from "@tanstack/react-query";

export default function AssignFormLayout<TUsers extends ReturnType<typeof useVirtualList>['allRows']>(props: {
  open: boolean, 
  onOpen: (isOpen: boolean) => void; 
  data?: InfiniteData<{
    data: ModelFields<AbstractUser>[];
    nextCursor: number | null;
  }, unknown>;
  fetchNextPage: () => void;
  item: InventoryInput;
  error?: Error | null;
  status: string;
  onSearch: (search: string) => void;
  onSelectUser: (user: TUsers[number]) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) {
  const { 
    parentRef,
    rowVirtualizer,
    allRows: allUsers
  } = useVirtualList({
    data: props.data,
    fetchNextPage: props.fetchNextPage,
    hasNextPage: props.hasNextPage,
    isFetchingNextPage: props.isFetchingNextPage,
    estimatedSize: 40,
  })

  return (
    <Modal title={`Assign #${props.item.serial} to user`} open={props.open} onOpen={props.onOpen}>
      <div className="flex flex-col min-w-96 w-[50vw] max-w-[624px] min-h-96 max-h-96 pl-2 pr-2 pt-1">
        <input 
        type='text' 
        placeholder='Search user' 
        className='p-2 rounded w-full mb-3 focus:outline-gray-200' 
        onChange={(e) => props.onSearch(e.target.value)}
        />
        <div ref={parentRef} className="flex flex-col w-full h-full overflow-auto">
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
                const isLoaderRow = virtualRow.index > allUsers.length - 1
                const user = allUsers[virtualRow.index];
                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {user === undefined ? (
                      isLoaderRow
                        ? props.hasNextPage
                          ? 'Loading more...'
                          : null
                        : 'No items found'
                    ) : (
                      <button 
                      className={`p-2 rounded w-full ${user.id === props.item.userId ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                      type="button" 
                      title="select user" 
                      onClick={() => props.onSelectUser(user)}
                      >
                        <p>{user.firstName} {user.lastName}</p>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
    )
}