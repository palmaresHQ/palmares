import type { Meta, StoryObj } from "@storybook/react";

import Navbar from "./Navbar.layout";
import ItemsFormLayout from "../ItemsForm/ItemsForm.layout";
import { MutationErrors } from "../../utils";

const Wrapper = (props: {
  shouldFail?: boolean,
}) => {
  return (
    <Navbar 
    getItemsForm={(itemsFormProps) => (
      <ItemsFormLayout 
      newItem={itemsFormProps.isAddingNewUser} 
      onClose={itemsFormProps.onClose}
      onAddOrUpdateData={async (item) => {
        const shouldFail = props.shouldFail;
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
      )}
    />
  );
};

const meta = {
  title: "Components/Navbar",
  component: Wrapper,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {},
};

export const WithServerFailure: Story = {
  args: {
    shouldFail: true,
  },
};
