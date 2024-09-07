import type { Meta, StoryObj } from "@storybook/react";

import { mockInventory } from 'shared';

import ItemsFormLayout from "../ItemsForm/ItemsForm.layout";
import { MutationErrors } from "../../utils";

const meta = {
  title: "Components/ItemsForm",
  component: ItemsFormLayout,
} satisfies Meta<typeof ItemsFormLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    newItem: true,
    item: undefined,
    onClose: () => {
      console.log("Closed");
    },
    onAddOrUpdateData: async (item) => {
      const shouldFail = Math.random() > 0.5;
      if (shouldFail) {
        throw new MutationErrors([{
          code: "serial",
          message: "Serial number already exists",
          path: ["serial"],
        }])
      }
      return Promise.resolve(item);
    },
  },
};

export const Existing: Story = {
  args: {
    newItem: undefined,
    item: mockInventory(1).rows[0],
    onClose: () => {
      console.log("Closed");
    },
    onAddOrUpdateData: async (item) => {
      const shouldFail = Math.random() > 0.5;
      if (shouldFail) {
        throw new MutationErrors([{
          code: "serial",
          message: "Serial number already exists",
          path: ["serial"],
        }])
      }
      return Promise.resolve(item);
    },
  },
};

