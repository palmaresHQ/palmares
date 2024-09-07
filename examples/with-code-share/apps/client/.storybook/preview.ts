import '../src/index.css'
import type { Preview } from "@storybook/react";

import { setDefaultAdapter, ZodSchemaAdapter } from 'shared'

setDefaultAdapter(new ZodSchemaAdapter());

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
