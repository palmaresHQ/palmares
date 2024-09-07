import { ComponentProps, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ArrayInventoryOutput, mockInventory, mockUsers } from 'shared';

import ItemsLayout from "./Items.layout";
import useGetMockedDataLikeReactInfiniteQuery from "../../hooks/usegetMockedDataLikeReactInfiniteQuery";
import ItemLayout from "../Item/Item.layout";
import ItemsFormLayout from "../ItemsForm/ItemsForm.layout";
import { MutationErrors } from "../../utils";
import { Wrapper as WrapperForAssignForm } from "../AssignForm/AssignForm.mock";

const WrapperForItem = (props: {
  key: number | string;
} & ComponentProps<typeof ItemLayout> & {
  users: ReturnType<typeof mockUsers>['rows'];
}) => {
  const [editOpen, setEditOpen] = useState<undefined | ArrayInventoryOutput[number]>(undefined);
  const [assignOpen, setAssignOpen] = useState<boolean>(false);

  return (
    <ItemLayout
    {...props}
    onOpenAssign={() => setAssignOpen(true)}
    onOpenEdit={() => {
      setEditOpen(props.item)
      props.onOpenEdit()
    }}
    onRemove={() => {
      props.onRemove()
    }}
    hasMore={props.hasMore}
    >
      <ItemsFormLayout 
      item={editOpen}
      onClose={() => setEditOpen(undefined)}
      onAddOrUpdateData={async (item) => {
        const shouldFail = Math.random() > 0.5;
        if (shouldFail) {
          throw new MutationErrors([{
            code: "serial",
            message: "Serial number already exists",
            path: ["serial"],
          }])
        }
        return Promise.resolve(item);
      }}
      />
      {props.item && (
        <WrapperForAssignForm
        item={props.item}
        open={assignOpen}
        onOpen={setAssignOpen}
        />
      )}
    </ItemLayout>
  )
}

const Wrapper = () => {
  const users = useMemo(() => mockUsers(60).rows, []);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useGetMockedDataLikeReactInfiniteQuery((nextCursor) => {    
  const mockedData = mockInventory(20, { offset: nextCursor as number | undefined, users });
    return {
      nextCursor: mockedData.nextOffset,
      rows: mockedData.rows,
    }
  }, 60)

  return (
    <div className="w-[100vw] h-[100vh]">
      <ItemsLayout
      data={data}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      status={status}
      onRenderItem={(key, props) => (
        <WrapperForItem key={key} 
        {...props}
        users={users}
        onOpenAssign={() => {}}
        onOpenEdit={() => {}}
        onRemove={() => {
          alert('Removing item')
        }}
        />
      )}
      />
    </div>
  );
};



const meta = {
  title: "Components/Items",
  component: Wrapper,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
};

