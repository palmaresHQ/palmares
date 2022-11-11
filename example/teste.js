const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, 'src', 'core', 'migrations');

fs.readdir(directoryPath, function (err, files) {
  //handling error
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  //listing all files using forEach
  const filteredFilesWithoutIndex = files.filter(
    (fileName) => fileName !== 'index.ts'
  );
  const contentsOfIndex = filteredFilesWithoutIndex
    .map(
      (fileName) =>
        `export { default as ${fileName.replace(
          '.ts',
          ''
        )} } from "${fileName}";`
    )
    .join('\n');
  console.log(contentsOfIndex);
});
