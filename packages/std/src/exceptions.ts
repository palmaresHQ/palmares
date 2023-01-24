export class ImportsError extends Error {
  constructor(packageName: string) {
    super(
      `Could not import '${packageName}' on the current platform. Or the package is not installed.`
    );
    this.name = 'ImportsError';
  }
}
