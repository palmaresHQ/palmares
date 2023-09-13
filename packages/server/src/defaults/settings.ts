export const DEFAULT_SERVER_PORT = 4000;

export const DEFAULT_STATUS_CODE_BY_METHOD = (method: string) => {
  const methodLowerCased = method.toLowerCase();
  switch (methodLowerCased) {
    case 'post':
      return 201;
    default:
      return 200;
  }
};
