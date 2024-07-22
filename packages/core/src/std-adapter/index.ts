import Asker from './asker';
import ChildProcess from './child-process';
import FilesAndFolders from './files';
import Os from './os';

export default class Std {
  asker!: Asker;
  files!: FilesAndFolders;
  childProcess!: ChildProcess;
  os!: Os;
}

export { Asker, FilesAndFolders, ChildProcess, Os };
