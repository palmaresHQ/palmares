import type { Meta, StoryObj } from "@storybook/react";

import {  mockInventory } from 'shared';

import { Wrapper } from "./AssignForm.mock";

const meta = {
  title: "Components/AssignForm",
  component: Wrapper,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    item: mockInventory(1).rows[0],
  },
};

