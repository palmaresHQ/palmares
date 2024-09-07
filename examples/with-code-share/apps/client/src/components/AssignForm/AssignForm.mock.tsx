import { InventoryInput,  mockUsers } from 'shared';

import useGetMockedDataLikeReactInfiniteQuery from "../../hooks/usegetMockedDataLikeReactInfiniteQuery";
import AssignFormLayout from "./AssignForm.layout";

export const Wrapper = (props: {
  open?: boolean;
  onOpen?: (isOpen: boolean) => void;
  item: InventoryInput;
  users?: ReturnType<typeof mockUsers>['rows'];
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useGetMockedDataLikeReactInfiniteQuery((nextCursor) => {   
  if (props.users) {
    if (nextCursor) {
      const offset = props.users.findIndex((user) => user.id === nextCursor);
      return {
        nextCursor: offset > -1 ? props.users[offset + 1]?.id : null,
        rows: props.users.slice(offset + 1, offset + 21),
      }
    }
    return {
      nextCursor: props.users[20]?.id,
      rows: props.users.slice(0, 20),
    }
  }

  const mockedData = mockUsers(20, { offset: nextCursor as number | undefined });
    return {
      nextCursor: mockedData.nextOffset,
      rows: mockedData.rows,
    }
  }, 60)

  return (
    <AssignFormLayout
      open={props.open ?? true}
      onOpen={(isOpen) => {
        if (props.onOpen) props.onOpen(isOpen);
      }}
      item={props.item}
      data={data}
      status={status}
      onSearch={() => {
        console.log('Searching')
      }}
      onSelectUser={() => {}}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};