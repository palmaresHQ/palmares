# @palmares/databases

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
