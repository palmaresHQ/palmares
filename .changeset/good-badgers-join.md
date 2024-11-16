---
'@palmares/drizzle-engine': patch
'@palmares/databases': patch
'@palmares/server': patch
'@palmares/node-std': patch
'@palmares/core': patch
'@palmares/console-logging': patch
'@palmares/eventemitter2-emitter': patch
'@palmares/express-adapter': patch
'@palmares/jest-tests': patch
'@palmares/redis-emitter': patch
'@palmares/sequelize-engine': patch
'@palmares/vercel-adapter': patch
'@palmares/zod-schema': patch
'@palmares/client': patch
'@palmares/events': patch
'@palmares/logging': patch
'@palmares/schemas': patch
'@palmares/tests': patch
---

- Changed the API of the integrators, now the integrators don't need to define a customOptions function, it will be available when the properly define the customOptions on the translate method.
