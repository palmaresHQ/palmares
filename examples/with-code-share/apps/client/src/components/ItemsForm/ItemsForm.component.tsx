import { InventoryInput } from "shared";

import { useAddItem, useEditItem } from "../../hooks";
import ItemsFormLayout from "./ItemsForm.layout";

export default function ItemsForm(props: { 
  newItem?: boolean; 
  item?: InventoryInput, 
  onClose?: () => void, 
}) {
  const updateItem = useEditItem();
  const addItem = useAddItem();

  return (
    <ItemsFormLayout
    item={props.item}
    newItem={props.newItem}
    onClose={props.onClose}
    onAddOrUpdateData={(item) => {
      const addItemOrUpdateItem = item.id ? updateItem : addItem;
      return addItemOrUpdateItem.mutateAsync(item);
    }}
    />
  )
}