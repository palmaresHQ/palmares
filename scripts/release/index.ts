// This file got the idea from: https://github.com/changesets/changesets/issues/885#issuecomment-1203334503
// And we pretty much did our own version of it, but we do follow the same principles.
import { getChangelogFile, runCommand } from './utils';

/**
 * This will get the changelog contents for a given package and version. It will extract the
 * changelog information from the version selected and changelog files.
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
 *
 * @param gitTags The git tags as a string. It will be something like this:
 * ```
 * @palmares/core@1.0.0                   @palmares/sequelize-engine@1.0.0
 * @palmares/databases@1.0.0              @palmares/std@1.0.0
 * @palmares/express-server@1.0.0
 * ```
 *
 * @returns An array of objects with the tags parsed by name, version and their raw value.
 */
function parseGitTags(gitTags: string) {
  const formattedTags = [] as {
    name: string;
    version: string;
    raw: string;
  }[];
  const tags = gitTags.split('\n');

  for (const tag of tags) {
    if (tag === '') continue;

    const [name, version] = tag.split(/@(\d.*)/);
    if (!name || !version) continue;
    else formattedTags.push({ name, version, raw: tag });
  }
  return formattedTags;
}

/**
 * This uses pnpm to get all of the packages and their paths. Without this we would need to
 * use some other tool or library and do it manually.
 * Since we are already using pnpm, why don't let it do the work for us?
 *
 * @returns An object with all of the packages by name and their path.
 */
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
        version: packageAsArray.version
      };
    }
    return packagesAsObject;
  } catch (error) {
    console.log('Could not parse JSON');
    return;
  }
}

/**
 * This will release all of the packages to github releases. It will get the changelog for
 * each package and release it to github properly formatted.
 */
async function releaseToGithub(parsedTags: ReturnType<typeof parseGitTags>) {
  const packagesByName = await getPackagesAndPathsByName();
  if (!packagesByName) {
    console.log('No packages found');
    return;
  }

  const promises = parsedTags.map(async (parsedTag) => {
    const packageToPublish = packagesByName[parsedTag.name];
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (!packageToPublish) {
      console.log(`Could not find package ${parsedTag.name}`);
      return;
    }
    console.log(packageToPublish);
    const changelogContents = await getChangelogFile(packageToPublish.path);
    if (!changelogContents) {
      console.log(`Could not find changelog for ${parsedTag.name}`);
      return;
    }

    const changelogText = parseChangelog(changelogContents, parsedTag.version);
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (changelogText === '' || changelogText === undefined) {
      console.log(`Could not find changelog text for ${parsedTag.name}`);
      return;
    }
    console.log(`Publishing ${parsedTag.raw} to github releases...`);
    await runCommand('gh', [
      'release',
      'create',
      parsedTag.raw,
      '--title',
      parsedTag.raw,
      '--notes',
      changelogText,
      '--target',
      'main'
    ]);
  });
  await Promise.all(promises);
}

async function getCurrentGitTagsParsed() {
  const data = await runCommand('git', ['tag', '--points-at', 'HEAD', '--column']);
  // eslint-disable-next-line ts/no-unnecessary-condition
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
  const parsedTags = await getCurrentGitTagsParsed();
  if (!parsedTags) return;
  releaseToGithub(parsedTags);
}

main();
