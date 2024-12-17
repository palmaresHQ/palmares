import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    colors: {
      'primary': {
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
      },
      'secondary': {
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b',
      },
      'tertiary': {
        200: '#fff6ee',
        300: '#ffecde',
        400: '#ffe3ce',
        500: '#ffdabd',
        600: '#ffd1ad',
        700: '#fdc79d',
        800: '#fcbe8e',
        900: '#f9b57e',
        950: '#f7ac6e',
      },
    },
  },
  plugins: [],
};
export default config;
