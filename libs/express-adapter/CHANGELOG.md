# @palmares/express-adapter

## 0.2.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

### Patch Changes

- Updated dependencies [d792775]
  - @palmares/server@0.2.0
  - @palmares/core@0.2.0

## 0.1.20

### Patch Changes

- Remove swc and building with tsup now
- Updated dependencies
  - @palmares/core@0.1.17
  - @palmares/server@0.1.19

## 0.1.19

### Patch Changes

- Update all for running on vite
- Updated core with export type
- Updated dependencies
- Updated dependencies
  - @palmares/server@0.1.18
  - @palmares/core@0.1.16

## 0.1.18

### Patch Changes

- Update all packages
- Updated dependencies
  - @palmares/server@0.1.17
  - @palmares/core@0.1.15

## 0.1.17

### Patch Changes

- Updated dependencies
  - @palmares/server@0.1.16

## 0.1.16

### Patch Changes

- 80b60c3: Go back to dependencies from peerDependencies, should work fine now
  - @palmares/server@0.1.15

## 0.1.15

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/server@0.1.14
  - @palmares/core@0.1.14

## 0.1.14

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/server@0.1.13
  - @palmares/core@0.1.13

## 0.1.13

### Patch Changes

- removed all default exports
- Updated dependencies
  - @palmares/server@0.1.12
  - @palmares/core@0.1.12

## 0.1.12

### Patch Changes

- Add named exports so it can function properly
- Updated dependencies
  - @palmares/server@0.1.11
  - @palmares/core@0.1.11

## 0.1.11

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs
- Updated dependencies
  - @palmares/core@0.1.10
  - @palmares/server@0.1.10

## 0.1.10

### Patch Changes

- New version because on last versions the changes werent applied
- Updated dependencies
  - @palmares/core@0.1.9
  - @palmares/server@0.1.9

## 0.1.9

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains
- Updated dependencies [421057e]
  - @palmares/server@0.1.8
  - @palmares/core@0.1.8

## 0.1.8

### Patch Changes

- Updated dependencies [44958f4]
  - @palmares/server@0.1.7
  - @palmares/core@0.1.7

## 0.1.7

### Patch Changes

- Updated dependencies [871b836]
  - @palmares/core@0.1.6
  - @palmares/server@0.1.6

## 0.1.6

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.5
  - @palmares/server@0.1.5

## 0.1.5

### Patch Changes

- Fix build issues on the release of new version

## 0.1.4

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client
- Updated dependencies [d49968e]
  - @palmares/server@0.1.4
  - @palmares/core@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.3
  - @palmares/server@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.2
  - @palmares/server@0.1.2

## 0.1.1

### Patch Changes

- Bug fixes
- Updated dependencies
  - @palmares/server@0.1.1
  - @palmares/core@0.1.1

## 0.1.0

### Minor Changes

- - Make it stable for release by doing a bunch of changes
  - Added eslint for properly formatting everything, this changed a bunch of files.
  - Fixed a bug on databases search operation with tests
  - Added tests and fixed issues on schemas
  - Finished zod-schemas implementation, now everything is implemented as it should.
  - Fixed all small issues on the schemas.

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.0
  - @palmares/server@0.1.0

## 0.0.2

### Patch Changes

- Unstable release, but already on npm
- Updated dependencies
  - @palmares/core@0.0.4
  - @palmares/server@0.0.2

## 0.0.1

### Patch Changes

- 4752bb1: Fixing dependencies versions
- Updated dependencies [4752bb1]
  - @palmares/core@0.0.3
  - @palmares/server@0.0.1

## 0.1.2

### Patch Changes

- asdasdsa
- Updated dependencies
  - @palmares/server@1.0.2

## 0.1.1

### Patch Changes

- Testing if changesets and if custom script works
- Updated dependencies
  - @palmares/server@1.0.1

## 0.1.0

### Minor Changes

- 374b4a4: Só testando

### Patch Changes

- Updated dependencies [374b4a4]
  - @palmares/server@1.0.0
