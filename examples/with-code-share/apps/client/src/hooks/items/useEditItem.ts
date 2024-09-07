import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { InventoryInput, ArrayInventoryOutput } from 'shared';

import { pFetch, MutationErrors } from '../../utils';

export default function useEditItem() {
  const queryClient = useQueryClient();

  const updateItem = useMutation({
    mutationFn: async (dataToUpdate: InventoryInput) => {
      if (!dataToUpdate.id) throw new Error('Item id is required to update');

      const response = await pFetch('/inventory/<uuid: {[\\w-]+}:string>', {
        method: 'PUT',
        body: dataToUpdate,
        params: {
          uuid: dataToUpdate.uuid
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok && response.status === 400) {
        const dataErrors = await response.json();
        throw new MutationErrors(dataErrors.errors);
      }
      return await response.json();
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items']) as InfiniteData<{
        data: ArrayInventoryOutput;
        nextOffset: number;
      }>;
      const newItems = structuredClone(previousItems);
      
      for (const page of newItems.pages) {
        for (let i = 0; i < page.data.length; i++) {
          const item = page.data[i];
          if (item.id === newItem.id) {
            page.data[i] = newItem as ArrayInventoryOutput[number];
          }
        }
      }

      queryClient.setQueryData(['items'], newItems)
      
      return { previousItems, newItems }
    },
    onError: (_, __, context) => {
      if (context) {
        queryClient.setQueryData(
          ['items'],
          context.previousItems,
        )
      }
    },
  });

  return updateItem;
}