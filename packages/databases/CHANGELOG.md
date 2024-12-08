# @palmares/databases

## 0.2.14

### Patch Changes

- f0003db: Set up the drizzle engine better so we can have dynamic fields and better support from drizzle overall

## 0.2.13

### Patch Changes

- b1b09b4: - Sequelize package
  - Fix small issue to allow empty migration files
  - Fix typings on Sequelize Engine
- Updated dependencies [b1b09b4]
  - @palmares/core@0.2.6
  - @palmares/events@0.1.6
  - @palmares/logging@0.2.6

## 0.2.12

### Patch Changes

- Updated dependencies [b0c5de7]
  - @palmares/core@0.2.5
  - @palmares/events@0.1.5
  - @palmares/logging@0.2.5

## 0.2.11

### Patch Changes

- 3d5119f: - Add arrow navigation to Std
  - Detach Std adapter from Std API
  - Validate positional arguments on CLI
- Updated dependencies [3d5119f]
  - @palmares/core@0.2.4
  - @palmares/events@0.1.4
  - @palmares/logging@0.2.4

## 0.2.10

### Patch Changes

- 4c6392c: Make it work on Windows, it was breaking when using dynamic imports
- Updated dependencies [4c6392c]
  - @palmares/core@0.2.3
  - @palmares/events@0.1.3
  - @palmares/logging@0.2.3

## 0.2.9

### Patch Changes

- 4c6107e: fix readme on templates, change ${appName} and ${packageManager} to the actual values

## 0.2.8

### Patch Changes

- 5d0081e: Fix drizzle template to run flawlessly

## 0.2.7

### Patch Changes

- ba3507a: - Fix adapters to work on template creation

## 0.2.6

### Patch Changes

- bcafd12: Fix drizzle template for @palmares/databases and palmares

## 0.2.5

### Patch Changes

- 00aa84d: - Changed the API of the integrators, now the integrators don't need to define a customOptions function, it will be available when the properly define the customOptions on the translate method.
- 05714f9: add a coverage to avoid errors on model initializing
- Updated dependencies [00aa84d]
  - @palmares/core@0.2.2
  - @palmares/events@0.1.2
  - @palmares/logging@0.2.2

## 0.2.4

### Patch Changes

- 9268a32: - Fix docs with better explanation on how to use palmares/databases when on standalone.
  - Fixed standalone to add palmares_migrations table when the engine runs.
- Updated dependencies [9268a32]
  - @palmares/core@0.2.1
  - @palmares/events@0.1.1
  - @palmares/logging@0.2.1

## 0.2.3

### Patch Changes

- Fix minor issues like docs, and code and probably typing

## 0.2.2

### Patch Changes

- Change on the docs and the file generating for drizzle-engine

## 0.2.1

### Patch Changes

- a1f191c: Drizzle engine now exports drizzle by itself.

## 0.2.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

### Patch Changes

- Updated dependencies [d792775]
  - @palmares/core@0.2.0
  - @palmares/events@0.1.0
  - @palmares/logging@0.2.0

## 0.1.22

### Patch Changes

- Remove swc and building with tsup now
- Updated dependencies
  - @palmares/core@0.1.17
  - @palmares/events@0.0.21
  - @palmares/logging@0.1.18

## 0.1.21

### Patch Changes

- Update all for running on vite
- Updated core with export type
- Updated dependencies
- Updated dependencies
  - @palmares/logging@0.1.17
  - @palmares/events@0.0.20
  - @palmares/core@0.1.16

## 0.1.20

### Patch Changes

- Update all packages
- Updated dependencies
  - @palmares/core@0.1.15
  - @palmares/events@0.0.19
  - @palmares/logging@0.1.16

## 0.1.19

### Patch Changes

- - For databases, we added the ability to use a functional model on abstracts
  - Fixed the loading of fields issue on queries
  - For server fixed the routes not loading.
  - Fixed handler404 not loading

## 0.1.18

### Patch Changes

- 80b60c3: Go back to dependencies from peerDependencies, should work fine now
- Updated dependencies [80b60c3]
  - @palmares/logging@0.1.15
  - @palmares/events@0.0.18

## 0.1.17

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/logging@0.1.14
  - @palmares/events@0.0.17
  - @palmares/core@0.1.14

## 0.1.16

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/core@0.1.13
  - @palmares/events@0.0.16
  - @palmares/logging@0.1.13

## 0.1.15

### Patch Changes

- removed all default exports
- Updated dependencies
  - @palmares/logging@0.1.12
  - @palmares/events@0.0.15
  - @palmares/core@0.1.12

## 0.1.14

### Patch Changes

- Add named exports so it can function properly
- Updated dependencies
  - @palmares/logging@0.1.11
  - @palmares/events@0.0.14
  - @palmares/core@0.1.11

## 0.1.13

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs
- Updated dependencies
  - @palmares/core@0.1.10
  - @palmares/events@0.0.13
  - @palmares/logging@0.1.10

## 0.1.12

### Patch Changes

- Small fixes, for schemas validate, and for databases just the tests

## 0.1.11

### Patch Changes

- New version because on last versions the changes werent applied
- Updated dependencies
  - @palmares/logging@0.1.9
  - @palmares/core@0.1.9
  - @palmares/events@0.0.12

## 0.1.10

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains
- Updated dependencies [421057e]
  - @palmares/logging@0.1.8
  - @palmares/events@0.0.11
  - @palmares/core@0.1.8

## 0.1.9

### Patch Changes

- 44958f4: Fix typings issues
- Updated dependencies [44958f4]
  - @palmares/events@0.0.10
  - @palmares/core@0.1.7
  - @palmares/logging@0.1.7

## 0.1.8

### Patch Changes

- Updated dependencies [871b836]
  - @palmares/core@0.1.6
  - @palmares/events@0.0.9
  - @palmares/logging@0.1.6

## 0.1.7

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.5
  - @palmares/events@0.0.8
  - @palmares/logging@0.1.5

## 0.1.6

### Patch Changes

- Exported schemas handler for easier management

## 0.1.5

### Patch Changes

- Fix build issues on the release of new version

## 0.1.4

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client
- Updated dependencies [d49968e]
  - @palmares/logging@0.1.4
  - @palmares/events@0.0.7
  - @palmares/core@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.3
  - @palmares/events@0.0.6
  - @palmares/logging@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.2
  - @palmares/events@0.0.5
  - @palmares/logging@0.1.2

## 0.1.1

### Patch Changes

- Bug fixes
- Updated dependencies
- Updated dependencies
  - @palmares/events@0.0.4
  - @palmares/core@0.1.1
  - @palmares/logging@0.1.1

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
  - @palmares/logging@0.1.0
  - @palmares/events@0.0.3

## 0.0.2

### Patch Changes

- e35d754: This introduces better documentation for database adapter methods/classes and added some new methods to some database adapters like the option to parse the result of the database. We tried the "OR" operator inside the query but decided to keep the way it is. We would need to bring too much change to the adapters
- Unstable release, but already on npm
- Updated dependencies
  - @palmares/core@0.0.4
  - @palmares/events@0.0.2
  - @palmares/logging@0.0.2

## 0.0.1

### Patch Changes

- 4752bb1: Fixing dependencies versions
- Updated dependencies [4752bb1]
  - @palmares/core@0.0.3
  - @palmares/events@0.0.1
  - @palmares/logging@0.0.1
  - @palmares/std@0.0.1
