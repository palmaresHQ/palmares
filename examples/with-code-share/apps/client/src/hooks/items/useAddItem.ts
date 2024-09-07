import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { InventoryInput, ArrayInventoryOutput } from 'shared';

import { pFetch, MutationErrors } from '../../utils';

export default function useAddItem() {
  const queryClient = useQueryClient();
  
  const addItem = useMutation({
    mutationFn: async (dataAdd: InventoryInput) => {
      const response = await pFetch('/inventory?cursor=number?', {
        method: 'POST',
        query: {},
        headers: {
          'Content-Type': 'application/json'
        },
        body: dataAdd,
      });

      if (!response.ok && response.status === 400) {
        const dataErrors = await response.json();
        throw new MutationErrors(dataErrors.errors);
      }
      return await response.json();
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['items'] })
      const previousItems = queryClient.getQueryData(['items']) as InfiniteData<{
        data: ArrayInventoryOutput;
        nextOffset: number;
      }>;
      
      const newItems = structuredClone(previousItems);
      if (newItems.pages.length > 0 && Array.isArray(newItems.pages[0].data)) {
        newItems.pages[0].data.unshift(newItem as ArrayInventoryOutput[number])
      }

      queryClient.setQueryData(['items'], newItems)
      
      return { previousItems, newItems }
    },
    // If the mutation fails, use the context we returned above
    onError: (_, __, context) => {
      if (context) queryClient.setQueryData(['items'], context.previousItems)
    },
  });

  return addItem;
}