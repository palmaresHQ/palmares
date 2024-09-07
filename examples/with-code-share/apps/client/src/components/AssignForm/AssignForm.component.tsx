import useUsers from "../../hooks/users/useUsers";
import { useEditItem } from "../../hooks";
import { InventoryInput } from "shared";
import AssignFormLayout from "./AssignForm.layout";

export default function AssignForm(props: { 
  open: boolean, 
  onOpen: (isOpen: boolean) => void; 
  item: InventoryInput,
}) {
  const editItem = useEditItem()
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    onSearch,
  } = useUsers()

  function onSelectUser(user: NonNullable<typeof data>['pages'][number]['data'][number]) {
    editItem.mutateAsync({
      ...props.item,
      assignmentDate: new Date().toISOString(),
      status: 'use',
      userId: user.id,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    }).then(() => {
      props.onOpen(false)
    })
  }
  
  return (
    <AssignFormLayout
      open={props.open}
      onOpen={props.onOpen}
      item={props.item}
      data={data}
      error={error}
      status={status}
      onSearch={onSearch}
      onSelectUser={onSelectUser}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  )
}