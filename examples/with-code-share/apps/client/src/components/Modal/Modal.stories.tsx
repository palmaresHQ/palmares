import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import Modal from "./Modal.component";

const Wrapper = (props: {
  open: boolean,
  title: string,
}) => {
  const [isOpen, setIsOpen] = useState(props.open);

  return (
    <>
      <button type="button" onClick={() => setIsOpen((prev) => !prev)}>Open Modal</button>
      <Modal
        title={props.title}
        open={isOpen}
        onOpen={(isOpen) => setIsOpen(isOpen)}
      >
        <p>Modal Content</p>
      </Modal>
    </>
  );
};

const meta = {
  title: "Components/Modal",
  component: Wrapper,
} satisfies Meta<typeof Wrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    open: false,
    title: "Modal Title"
  },
};

export const WithDifferentTitle: Story = {
  args: {
    open: false,
    title: "Really Long Modal Title for testing"
  },
};

export const Opened: Story = {
  args: {
    open: true,
    title: "Modal Title"
  },
};
