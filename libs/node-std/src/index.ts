import { AskerNode, ChildProcessNode, FilesAndFoldersNode, NodeOs } from './interfaces';

import type { Std } from '@palmares/core';

export default class NodeJsStd implements Std {
  files = new FilesAndFoldersNode();
  asker = new AskerNode();
  childProcess = new ChildProcessNode();
  os = new NodeOs();
}
