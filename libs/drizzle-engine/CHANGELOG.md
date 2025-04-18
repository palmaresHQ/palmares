# @palmares/sequelize-engine

## 0.2.14

### Patch Changes

- f0003db: Set up the drizzle engine better so we can have dynamic fields and better support from drizzle overall
- Updated dependencies [f0003db]
  - @palmares/databases@0.2.14

## 0.2.13

### Patch Changes

- b1b09b4: - Sequelize package
  - Fix small issue to allow empty migration files
  - Fix typings on Sequelize Engine
- Updated dependencies [b1b09b4]
  - @palmares/databases@0.2.13
  - @palmares/core@0.2.6

## 0.2.12

### Patch Changes

- Updated dependencies [b0c5de7]
  - @palmares/core@0.2.5
  - @palmares/databases@0.2.12

## 0.2.11

### Patch Changes

- 3d5119f: - Add arrow navigation to Std
  - Detach Std adapter from Std API
  - Validate positional arguments on CLI
- Updated dependencies [3d5119f]
  - @palmares/databases@0.2.11
  - @palmares/core@0.2.4

## 0.2.10

### Patch Changes

- 4c6392c: Make it work on Windows, it was breaking when using dynamic imports
- Updated dependencies [4c6392c]
  - @palmares/databases@0.2.10
  - @palmares/core@0.2.3

## 0.2.9

### Patch Changes

- 4c6107e: fix readme on templates, change ${appName} and ${packageManager} to the actual values
- Updated dependencies [4c6107e]
  - @palmares/databases@0.2.9

## 0.2.8

### Patch Changes

- 5d0081e: Fix drizzle template to run flawlessly
- Updated dependencies [5d0081e]
  - @palmares/databases@0.2.8

## 0.2.7

### Patch Changes

- ba3507a: - Fix adapters to work on template creation
- Updated dependencies [ba3507a]
  - @palmares/databases@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [bcafd12]
  - @palmares/databases@0.2.6

## 0.2.5

### Patch Changes

- 00aa84d: - Changed the API of the integrators, now the integrators don't need to define a customOptions function, it will be available when the properly define the customOptions on the translate method.
- Updated dependencies [00aa84d]
- Updated dependencies [05714f9]
  - @palmares/databases@0.2.5
  - @palmares/core@0.2.2

## 0.2.4

### Patch Changes

- 9268a32: - Fix docs with better explanation on how to use palmares/databases when on standalone.
  - Fixed standalone to add palmares_migrations table when the engine runs.
- Updated dependencies [9268a32]
  - @palmares/databases@0.2.4
  - @palmares/core@0.2.1

## 0.2.3

### Patch Changes

- Fix minor issues like docs, and code and probably typing
- Updated dependencies
  - @palmares/databases@0.2.3

## 0.2.2

### Patch Changes

- Change on the docs and the file generating for drizzle-engine
- Updated dependencies
  - @palmares/databases@0.2.2

## 0.2.1

### Patch Changes

- a1f191c: Drizzle engine now exports drizzle by itself.
- Updated dependencies [a1f191c]
  - @palmares/databases@0.2.1

## 0.2.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

### Patch Changes

- Updated dependencies [d792775]
  - @palmares/databases@0.2.0
  - @palmares/core@0.2.0

## 0.1.24

### Patch Changes

- require only is failing on esbuild, so now it tries require and then goes tries to use import

## 0.1.23

### Patch Changes

- Remove swc and building with tsup now
- Updated dependencies
  - @palmares/core@0.1.17
  - @palmares/databases@0.1.22

## 0.1.22

### Patch Changes

- Update all for running on vite
- Updated core with export type
- Updated dependencies
- Updated dependencies
  - @palmares/databases@0.1.21
  - @palmares/core@0.1.16

## 0.1.21

### Patch Changes

- Update all packages
- Updated dependencies
  - @palmares/databases@0.1.20
  - @palmares/core@0.1.15

## 0.1.20

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.1.19

## 0.1.19

### Patch Changes

- 80b60c3: Go back to dependencies from peerDependencies, should work fine now
- Updated dependencies [80b60c3]
  - @palmares/databases@0.1.18

## 0.1.18

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/databases@0.1.17
  - @palmares/core@0.1.14

## 0.1.17

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/databases@0.1.16
  - @palmares/core@0.1.13

## 0.1.16

### Patch Changes

- removed all default exports
- Updated dependencies
  - @palmares/databases@0.1.15
  - @palmares/core@0.1.12

## 0.1.15

### Patch Changes

- Add named exports so it can function properly
- Updated dependencies
  - @palmares/databases@0.1.14
  - @palmares/core@0.1.11

## 0.1.14

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs
- Updated dependencies
  - @palmares/core@0.1.10
  - @palmares/databases@0.1.13

## 0.1.13

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.1.12

## 0.1.12

### Patch Changes

- 6f2a099: Added limit and offset to drizzle querying

## 0.1.11

### Patch Changes

- New version because on last versions the changes werent applied
- Updated dependencies
  - @palmares/databases@0.1.11
  - @palmares/core@0.1.9

## 0.1.10

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains
- Updated dependencies [421057e]
  - @palmares/databases@0.1.10
  - @palmares/core@0.1.8

## 0.1.9

### Patch Changes

- Updated dependencies [44958f4]
  - @palmares/databases@0.1.9
  - @palmares/core@0.1.7

## 0.1.8

### Patch Changes

- Updated dependencies [871b836]
  - @palmares/core@0.1.6
  - @palmares/databases@0.1.8

## 0.1.7

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.5
  - @palmares/databases@0.1.7

## 0.1.6

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.1.6

## 0.1.5

### Patch Changes

- Fix build issues on the release of new version
- Updated dependencies
  - @palmares/databases@0.1.5

## 0.1.4

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client
- Updated dependencies [d49968e]
  - @palmares/databases@0.1.4
  - @palmares/core@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.3
  - @palmares/databases@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.2
  - @palmares/databases@0.1.2

## 0.1.1

### Patch Changes

- Bug fixes
- Updated dependencies
  - @palmares/databases@0.1.1
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
  - @palmares/databases@0.1.0

## 0.0.2

### Patch Changes

- Unstable release, but already on npm
- Updated dependencies [e35d754]
- Updated dependencies
  - @palmares/databases@0.0.2
  - @palmares/core@0.0.4

## 0.0.1

### Patch Changes

- 4752bb1: Fixing dependencies versions
- Updated dependencies [4752bb1]
  - @palmares/core@0.0.3
  - @palmares/databases@0.0.1

## 0.1.2

### Patch Changes

- asdasdsa
- Updated dependencies
  - @palmares/databases@0.1.2
  - @palmares/core@0.1.2

## 0.1.1

### Patch Changes

- Testing if changesets and if custom script works
- Updated dependencies
  - @palmares/core@0.1.1
  - @palmares/databases@0.1.1

## 0.1.0

### Minor Changes

- 374b4a4: Só testando

### Patch Changes

- Updated dependencies [374b4a4]
  - @palmares/databases@0.1.0
  - @palmares/core@0.1.0
