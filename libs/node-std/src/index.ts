import { Std } from '@palmares/core';

import { FilesAndFoldersNode, ChildProcessNode, AskerNode, NodeOs } from './interfaces';

export default class NodeJsStd implements Std {
  files = new FilesAndFoldersNode();
  asker = new AskerNode();
  childProcess = new ChildProcessNode();
  os = new NodeOs();
}
