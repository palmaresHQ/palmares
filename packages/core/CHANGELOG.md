# @palmares/core

## 0.2.5

### Patch Changes

- b0c5de7: writeFile on std was appending and not writting

## 0.2.4

### Patch Changes

- 3d5119f: - Add arrow navigation to Std
  - Detach Std adapter from Std API
  - Validate positional arguments on CLI

## 0.2.3

### Patch Changes

- 4c6392c: Make it work on Windows, it was breaking when using dynamic imports

## 0.2.2

### Patch Changes

- 00aa84d: - Changed the API of the integrators, now the integrators don't need to define a customOptions function, it will be available when the properly define the customOptions on the translate method.

## 0.2.1

### Patch Changes

- 9268a32: - Fix docs with better explanation on how to use palmares/databases when on standalone.
  - Fixed standalone to add palmares_migrations table when the engine runs.

## 0.2.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

## 0.1.17

### Patch Changes

- Remove swc and building with tsup now

## 0.1.16

### Patch Changes

- Update all for running on vite
- Updated core with export type

## 0.1.15

### Patch Changes

- Update all packages

## 0.1.14

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally

## 0.1.13

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency

## 0.1.12

### Patch Changes

- removed all default exports

## 0.1.11

### Patch Changes

- Add named exports so it can function properly

## 0.1.10

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs

## 0.1.9

### Patch Changes

- New version because on last versions the changes werent applied

## 0.1.8

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains

## 0.1.7

### Patch Changes

- 44958f4: Fix typings issues

## 0.1.6

### Patch Changes

- 871b836: - let schema models be used without models being initialized
  - Fix testing library issue where it was not being loaded

## 0.1.5

### Patch Changes

- The logging was not working so i have noticed that the domains were not properly loading as it should

## 0.1.4

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client

## 0.1.3

### Patch Changes

- Fix issue with version

## 0.1.2

### Patch Changes

- Republish

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

## 0.0.4

### Patch Changes

- Unstable release, but already on npm

## 0.0.3

### Patch Changes

- 4752bb1: Fixing dependencies versions
