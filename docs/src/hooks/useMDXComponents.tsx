import { UseMdxComponents } from '@mdx-js/mdx';

export function useMDXComponents(): ReturnType<UseMdxComponents> {
  return {
    h1: (props) => <h1 className={'text-3xl font-bold text-red-500'} {...props} />,
  };
}
