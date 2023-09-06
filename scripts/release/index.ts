import { getChangelogFile, runCommand } from './utils';

/**
 * This will get the changelog contents for a given package and version. It will extract the changelog information from the version selected and changelog files.
 * It will return the changelog text for the given version.
 *
 * @param changelog The hole changelog file contents as a string.
 * @param version The version to extract the changelog from.
 *
 * @returns The changelog text for the given version.
 */
function parseChangelog(changelog: string, version: string) {
  let wasVersionFound = false;
  let changelogText = '';
  const appendChangelog = (text: string) => (changelogText = changelogText.concat(text, '\n'));

  for (const line of changelog.split('\n')) {
    if (line.startsWith(`## ${version}`)) {
      if (wasVersionFound) break;
      wasVersionFound = true;
    } else if (line.startsWith('## ')) {
      if (wasVersionFound) break;
      else continue;
    } else if (wasVersionFound) appendChangelog(line);
  }

  return changelogText.trim();
}

/**
 * Parses all of the git tags from the current commit and returns an array of all of the tags.
 */
function parseGitTags(gitTags: string) {
  const formattedTags = [] as {
    name: string;
    version: string;
    raw: string;
  }[];
  const tags = gitTags.split('\n');

  for (const tag of tags) {
    const splittedTags = tag.split(' ');
    if (splittedTags.length > 1) {
      for (const splittedTag of splittedTags) {
        if (splittedTag !== '') {
          const [name, version] = splittedTag.split(/@(\d.*)/);
          if (!name || !version) continue;
          else formattedTags.push({ name, version, raw: splittedTag });
        }
      }
    }
  }
  return formattedTags;
}

async function getPackagesAndPathsByName() {
  // Reference: https://github.com/pnpm/pnpm/issues/1519#issuecomment-1299922699
  const data = await runCommand('pnpm', ['m', 'ls', '--json', '--depth=-1']);
  try {
    const packagesAsArray = (JSON.parse(data.toString()) || []) as {
      name: string;
      path: string;
      version: string;
      private: boolean;
    }[];
    const packagesAsObject = {} as Record<string, { path: string; version: string }>;
    for (const packageAsArray of packagesAsArray) {
      packagesAsObject[packageAsArray.name] = {
        path: packageAsArray.path,
        version: packageAsArray.version,
      };
    }
    return packagesAsObject;
  } catch (error) {
    console.log('Could not parse JSON');
    return;
  }
}

async function releaseToGithub(parsedTags: ReturnType<typeof parseGitTags>) {
  const packagesByName = await getPackagesAndPathsByName();
  if (!packagesByName) {
    console.log('No packages found');
    return;
  }

  const promises = parsedTags.map(async (parsedTag) => {
    const packageToPublish = packagesByName[parsedTag.name];
    if (!packageToPublish) {
      console.log(`Could not find package ${parsedTag.name}`);
      return;
    }
    const changelogContents = await getChangelogFile(packageToPublish.path);
    if (!changelogContents) {
      console.log(`Could not find changelog for ${parsedTag.name}`);
      return;
    }

    const changelogText = parseChangelog(changelogContents, parsedTag.version);
    if (changelogText === '' || changelogText === undefined) {
      console.log(`Could not find changelog text for ${parsedTag.name}`);
      return;
    }
    console.log(`Publishing ${parsedTag.raw} to github releases...`);
    await runCommand('gh', [
      'release',
      'create',
      '--target',
      'main',
      parsedTag.raw,
      '--title',
      parsedTag.raw,
      '--notes',
      changelogText,
    ]);
  });
  await Promise.all(promises);
}

async function getCurrentGitTagsParsed() {
  const data = await runCommand('git', ['tag', '--points-at', 'HEAD', '--column']);
  if (!data) {
    console.log('No data found');
    return;
  }
  const parsedTags = parseGitTags(data.toString());
  if (parsedTags.length === 0) {
    console.log('No tags found');
    return;
  }
  return parsedTags;
}

async function main() {
  console.log('teste');
  const parsedTags = await getCurrentGitTagsParsed();
  console.log(parsedTags);
  if (!parsedTags) return;
  releaseToGithub(parsedTags);
}

main();
