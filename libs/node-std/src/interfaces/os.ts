import { platform as nodePlatform, release as nodeRelease } from 'os';

import type { Os } from '@palmares/core';

export class NodeOs implements Os {
  async release() {
    return nodeRelease();
  }
  async cwd() {
    return process.cwd();
  }
  async platform() {
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
