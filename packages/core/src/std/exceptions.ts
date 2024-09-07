export class ImportsError extends Error {
  constructor(packageName: string) {
    super(`Could not import '${packageName}' on the current platform. Or the package is not installed.`);
    this.name = 'ImportsError';
  }
}

export class StdNotSetError extends Error {
  constructor() {
    super(
      'Default standard library not set. Please make sure you install `@palmares/std`, and add it ' +
        'at the top of your installed domains like: `installedDomains: ' +
        '[[StdDomain, { STD: NodeStd }], ...// other domains]`'
    );
    this.name = 'StdNotSetError';
  }
}
