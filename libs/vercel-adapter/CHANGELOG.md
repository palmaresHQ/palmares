# @palmares/vercel-adapter

## 0.1.3

### Patch Changes

- 00aa84d: - Changed the API of the integrators, now the integrators don't need to define a customOptions function, it will be available when the properly define the customOptions on the translate method.
- Updated dependencies [00aa84d]
  - @palmares/server@0.2.3

## 0.1.2

### Patch Changes

- @palmares/server@0.2.2

## 0.1.1

### Patch Changes

- Updated dependencies [a1f191c]
  - @palmares/server@0.2.1

## 0.1.0

### Minor Changes

- d792775: - Added QuerySet, add documentation for databases.
  - Better typescript type safety on queries.
  - Changed testing, because it was not working with "type": "module",
  - Changed core

### Patch Changes

- Updated dependencies [d792775]
  - @palmares/server@0.2.0

## 0.0.23

### Patch Changes

- Remove swc and building with tsup now
- Updated dependencies
  - @palmares/server@0.1.19

## 0.0.22

### Patch Changes

- Update all for running on vite
- Updated core with export type
- Updated dependencies
- Updated dependencies
  - @palmares/server@0.1.18

## 0.0.21

### Patch Changes

- Update all packages
- Updated dependencies
  - @palmares/server@0.1.17

## 0.0.20

### Patch Changes

- Updated dependencies
  - @palmares/server@0.1.16

## 0.0.19

### Patch Changes

- @palmares/server@0.1.15

## 0.0.18

### Patch Changes

- c5f4e08: - Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
- Updated dependencies [c5f4e08]
  - @palmares/server@0.1.14

## 0.0.17

### Patch Changes

- add everything as peer dependencies of one another
- Everything now has peer dependencies instead of dependency
- Updated dependencies
- Updated dependencies
  - @palmares/server@0.1.13

## 0.0.16

### Patch Changes

- removed all default exports
- Updated dependencies
  - @palmares/server@0.1.12

## 0.0.15

### Patch Changes

- Add named exports so it can function properly
- Updated dependencies
  - @palmares/server@0.1.11

## 0.0.14

### Patch Changes

- Fix module issues to allow palmares to run as a module as well as commonjs
- Updated dependencies
  - @palmares/server@0.1.10

## 0.0.13

### Patch Changes

- 5d75ca6: Fix import for esm modules

## 0.0.12

### Patch Changes

- New version because on last versions the changes werent applied
- Updated dependencies
  - @palmares/server@0.1.9

## 0.0.11

### Patch Changes

- 421057e: Remove \_\_dirname on all core packages domains
- Updated dependencies [421057e]
  - @palmares/server@0.1.8

## 0.0.10

### Patch Changes

- Updated dependencies [44958f4]
  - @palmares/server@0.1.7

## 0.0.9

### Patch Changes

- @palmares/server@0.1.6

## 0.0.8

### Patch Changes

- @palmares/server@0.1.5

## 0.0.7

### Patch Changes

- d49968e: Better typescript support for most stuff, added handler to the schemas and modified a lot the server stuff to comply with the client
- Updated dependencies [d49968e]
  - @palmares/server@0.1.4

## 0.0.6

### Patch Changes

- @palmares/server@0.1.3

## 0.0.5

### Patch Changes

- @palmares/server@0.1.2

## 0.0.4

### Patch Changes

- Bug fixes
- Updated dependencies
  - @palmares/server@0.1.1

## 0.0.3

### Patch Changes

- Updated dependencies
  - @palmares/server@0.1.0

## 0.0.2

### Patch Changes

- Unstable release, but already on npm
- Updated dependencies
  - @palmares/server@0.0.2
