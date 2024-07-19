import Asker from './asker';
import FilesAndFolders from './files';
import ChildProcess from './child-process';
import Os from './os';

export default class Std {
  asker!: Asker;
  files!: FilesAndFolders;
  childProcess!: ChildProcess;
  os!: Os;
}

export { Asker, FilesAndFolders, ChildProcess, Os };
