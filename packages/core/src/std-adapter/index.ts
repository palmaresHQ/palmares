import type { Asker } from './asker';
import type { ChildProcess } from './child-process';
import type { FilesAndFolders } from './files';
import type { Os } from './os';
import type { AskSelect } from './select';

export class Std {
  asker!: Asker;
  files!: FilesAndFolders;
  childProcess!: ChildProcess;
  os!: Os;
}

export type { Asker, FilesAndFolders, ChildProcess, Os, AskSelect };
