import { Os, imports, ImportsError } from '@palmares/std';
export default class NodeOs implements Os {
  async release() {
    const nodeRelease = await imports<typeof import('os').release>('os', { apiName: 'release' });
    if (!nodeRelease) throw new ImportsError('nodejs os release');

    return nodeRelease();
  }
  async platform() {
    const nodePlatform = await imports<typeof import('os').platform>('os', { apiName: 'platform' });
    if (!nodePlatform) throw new ImportsError('nodejs os platform');

    switch (nodePlatform()) {
      case 'darwin':
        return 'darwin';
      case 'win32':
        return 'windows';
      case 'linux':
        return 'linux';
      default:
        return 'linux';
    }
  }
}
