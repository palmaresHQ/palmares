# @palmares/console-logging

## 0.1.9

### Patch Changes

- 80b60c3: Go back to dependencies from peerDependencies, should work fine now
- Updated dependencies [80b60c3]
  - @palmares/logging@0.1.15

## 0.1.8

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/logging@0.1.14

## 0.1.7

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/logging@0.1.13

## 0.1.6

### Patch Changes

- removed all default exports

## 0.1.5

### Patch Changes

- Add named exports so it can function properly

## 0.1.4

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs

## 0.1.3

### Patch Changes

- New version because on last versions the changes werent applied

## 0.1.2

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client

## 0.1.1

### Patch Changes

- Bug fixes

## 0.1.0

### Minor Changes

- - Make it stable for release by doing a bunch of changes
  - Added eslint for properly formatting everything, this changed a bunch of files.
  - Fixed a bug on databases search operation with tests
  - Added tests and fixed issues on schemas
  - Finished zod-schemas implementation, now everything is implemented as it should.
  - Fixed all small issues on the schemas.

## 0.0.2

### Patch Changes

- Unstable release, but already on npm

## 0.0.1

### Patch Changes

- 4752bb1: Fixing dependencies versions
