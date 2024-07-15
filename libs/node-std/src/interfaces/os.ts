import { Os } from '@palmares/core';

import { platform as nodePlatform, release as nodeRelease } from 'os';
export default class NodeOs implements Os {
  async release() {
    return nodeRelease();
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
