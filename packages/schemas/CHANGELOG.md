# @palmares/schemas

## 0.2.8

### Patch Changes

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
  - @palmares/server@0.2.3
  - @palmares/core@0.2.2

## 0.2.4

### Patch Changes

- Updated dependencies [9268a32]
  - @palmares/databases@0.2.4
  - @palmares/core@0.2.1
  - @palmares/server@0.2.2

## 0.2.3

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.2.2

## 0.2.1

### Patch Changes

- a1f191c: Drizzle engine now exports drizzle by itself.
- Updated dependencies [a1f191c]
  - @palmares/databases@0.2.1
  - @palmares/server@0.2.1

## 0.2.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

### Patch Changes

- Updated dependencies [d792775]
  - @palmares/databases@0.2.0
  - @palmares/server@0.2.0
  - @palmares/core@0.2.0

## 0.1.26

### Patch Changes

- Remove swc and building with tsup now
- Updated dependencies
  - @palmares/core@0.1.17
  - @palmares/databases@0.1.22
  - @palmares/server@0.1.19

## 0.1.25

### Patch Changes

- Update all for running on vite
- Updated core with export type
- Updated dependencies
- Updated dependencies
  - @palmares/databases@0.1.21
  - @palmares/server@0.1.18
  - @palmares/core@0.1.16

## 0.1.24

### Patch Changes

- Update all packages
- Updated dependencies
  - @palmares/databases@0.1.20
  - @palmares/server@0.1.17
  - @palmares/core@0.1.15

## 0.1.23

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.1.19
  - @palmares/server@0.1.16

## 0.1.22

### Patch Changes

- 80b60c3: Go back to dependencies from peerDependencies, should work fine now
- Updated dependencies [80b60c3]
  - @palmares/databases@0.1.18
  - @palmares/server@0.1.15

## 0.1.21

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/databases@0.1.17
  - @palmares/server@0.1.14
  - @palmares/core@0.1.14

## 0.1.20

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/databases@0.1.16
  - @palmares/server@0.1.13
  - @palmares/core@0.1.13

## 0.1.19

### Patch Changes

- removed all default exports
- Updated dependencies
  - @palmares/databases@0.1.15
  - @palmares/server@0.1.12
  - @palmares/core@0.1.12

## 0.1.18

### Patch Changes

- Add named exports so it can function properly
- Updated dependencies
  - @palmares/databases@0.1.14
  - @palmares/server@0.1.11
  - @palmares/core@0.1.11

## 0.1.17

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs
- Updated dependencies
  - @palmares/core@0.1.10
  - @palmares/databases@0.1.13
  - @palmares/server@0.1.10

## 0.1.16

### Patch Changes

- Small fixes, for schemas validate, and for databases just the tests
- Updated dependencies
  - @palmares/databases@0.1.12

## 0.1.15

### Patch Changes

- 32e7569: Last build was bugged, didn't build

## 0.1.14

### Patch Changes

- 418abd3: - .validate was not working previously

## 0.1.13

### Patch Changes

- Didn't build the package before

## 0.1.12

### Patch Changes

- 733c643: this.constructor.name was not working on an ESM environment

## 0.1.11

### Patch Changes

- New version because on last versions the changes werent applied
- Updated dependencies
  - @palmares/databases@0.1.11
  - @palmares/core@0.1.9
  - @palmares/server@0.1.9

## 0.1.10

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains
- Updated dependencies [421057e]
  - @palmares/databases@0.1.10
  - @palmares/server@0.1.8
  - @palmares/core@0.1.8

## 0.1.9

### Patch Changes

- 44958f4: Fix typings issues
- Updated dependencies [44958f4]
  - @palmares/databases@0.1.9
  - @palmares/server@0.1.7
  - @palmares/core@0.1.7

## 0.1.8

### Patch Changes

- 871b836: - let schema models be used without models being initialized
  - Fix testing library issue where it was not being loaded
- Updated dependencies [871b836]
  - @palmares/core@0.1.6
  - @palmares/databases@0.1.8
  - @palmares/server@0.1.6

## 0.1.7

### Patch Changes

- Updated dependencies
  - @palmares/core@0.1.5
  - @palmares/databases@0.1.7
  - @palmares/server@0.1.5

## 0.1.6

### Patch Changes

- Exported schemas handler for easier management
- Updated dependencies
  - @palmares/databases@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies
  - @palmares/databases@0.1.5

## 0.1.4

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client
- Updated dependencies [d49968e]
  - @palmares/databases@0.1.4
  - @palmares/server@0.1.4
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

## 0.0.1

### Patch Changes

- Unstable release, but already on npm
- Updated dependencies [e35d754]
- Updated dependencies
  - @palmares/databases@0.0.2
  - @palmares/core@0.0.4
