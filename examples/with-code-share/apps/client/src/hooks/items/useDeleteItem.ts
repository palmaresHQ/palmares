import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { InventoryInput, ArrayInventoryOutput } from 'shared';

import { pFetch } from '../../utils';

export default function useDeleteItem() {
  const queryClient = useQueryClient();
  
  const removeItem = useMutation({
    mutationFn: async (dataToRemove: InventoryInput) => {
      const response = await pFetch('/inventory/<uuid: {[\\w-]+}:string>', {
        method: 'DELETE',
        headers: undefined,
        body: undefined,
        params: {
          uuid: dataToRemove.uuid
        }
      });
      return await response.json();
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['items'] })
      const previousItems = queryClient.getQueryData(['items']) as InfiniteData<{
        data: ArrayInventoryOutput;
        nextOffset: number;
      }>;
      
      const newItems = structuredClone(previousItems);
      for (const page of newItems.pages) {
        page.data = page.data.filter((item) => item.uuid !== newItem.uuid)
      }

      queryClient.setQueryData(['items'], newItems)
      
      return { previousItems, newItems }
    },
    // If the mutation fails, use the context we returned above
    onError: (_, __, context) => {
      if (context) queryClient.setQueryData(['items'], context.previousItems)
    },
  });

  return removeItem;
}