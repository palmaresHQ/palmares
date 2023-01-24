import { Std } from '@palmares/std';

import { FilesAndFoldersNode } from './interfaces';
import AskerNode from './interfaces/asker';

export default class NodeJsStd implements Std {
  files = new FilesAndFoldersNode();
  asker = new AskerNode();
}
