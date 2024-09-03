# @palmares/databases

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
