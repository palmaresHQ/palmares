import { useState } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

import ItemsForm from '../ItemsForm/ItemsForm.component';
import AssignForm from '../AssignForm/AssignForm.component';
import { useDeleteItem } from '../../hooks';

import type { ArrayInventoryOutput } from 'shared';
import ItemLayout from './Item.layout';

export default function Item(props: { 
  isLoaderRow: boolean,
  virtualRow: VirtualItem,
  hasMore: boolean,
  item?: ArrayInventoryOutput[number], 
}) {
  const removeItem = useDeleteItem();
  const [editOpen, setEditOpen] = useState<undefined | ArrayInventoryOutput[number]>(undefined);
  const [assignOpen, setAssignOpen] = useState<boolean>(false);
  
  return (
    <ItemLayout
    onOpenAssign={() => setAssignOpen(true)}
    onOpenEdit={() => setEditOpen(props.item)}
    onRemove={() => { 
      if (props.item) removeItem.mutateAsync(props.item)
    }}
    isLoaderRow={props.isLoaderRow}
    virtualRow={props.virtualRow}
    hasMore={props.hasMore}
    item={props.item}
    >
      <ItemsForm 
      item={editOpen} 
      onClose={() => setEditOpen(undefined)} 
      />
      {props.item !== undefined ? (
        <AssignForm 
        open={assignOpen} 
        onOpen={setAssignOpen}
        item={props.item}
        />
      ) : null}
    </ItemLayout>
  )
}