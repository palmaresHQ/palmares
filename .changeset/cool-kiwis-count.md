---
'@palmares/eventemitter2-emitter': patch
'@palmares/server-vercel': patch
'@palmares/sequelize-engine': patch
'@palmares/console-logging': patch
'@palmares/express-adapter': patch
'@palmares/drizzle-engine': patch
'@palmares/vercel-adapter': patch
'@palmares/redis-emitter': patch
'@palmares/databases': patch
'@palmares/logging': patch
'@palmares/schemas': patch
'@palmares/jest-tests': patch
'@palmares/zod-schema': patch
'@palmares/client': patch
'@palmares/events': patch
'@palmares/server': patch
'@palmares/tests': patch
'@palmares/node-std': patch
'@palmares/core': patch
---

- Added ESModules support, you can have deeply nested packages and it wont affect the function of your app. For example, if module A has a dependency in @palmares/schema, and palmares schema depends on @palmares/core, it will work normally
