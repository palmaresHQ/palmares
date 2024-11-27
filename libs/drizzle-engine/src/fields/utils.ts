export function getBuilderArgs(
  builder: {
    type: string;
    databaseName: string;
    args?: string;
  },
  callback: (defaultOptions: [string, string][]) => [string, string][]
) {
  const defaultOptions = callback([]);
  return (customAttributesArgs: any, customAttributesOptions: any) => {
    const customAttributesDefined = new Set(Object.keys(customAttributesOptions || {}));
    // eslint-disable-next-line ts/no-unnecessary-type-assertion
    const builderArgs = (Object.entries(customAttributesOptions || {}) as [string, any[]][]).map(([method, args]) => {
      return [
        method,
        args.map((arg: any) => (typeof arg === 'object' ? JSON.stringify(arg) : arg.toString())).join(', ')
      ];
    });

    for (const [method, args] of defaultOptions)
      if (!customAttributesDefined.has(method)) builderArgs.push([method, args]);

    const builderArguments = builderArgs
      .map(([method, args]) => {
        return (args || []).length > 0 ? `.${method}(${args})` : `.${method}()`;
      })
      .join('');
    return `d.${builder.type}('${builder.databaseName}'${
      customAttributesArgs !== undefined || builder.args
        ? `, ${customAttributesArgs !== undefined ? JSON.stringify(customAttributesArgs) : builder.args}`
        : ''
    })${builderArguments}`;
  };
}
