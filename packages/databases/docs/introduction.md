# Palmares/Databases

## Introduction

This documentation will walk you through [palmares](https://github.com/palmaresHQ/palmares), but focusing on the [@palmares/databases](https://www.npmjs.com/package/@palmares/databases) package.

### A rough and quick intro to Palmares

The goal of [palmares](https://github.com/palmaresHQ/palmares) is to give you, the programmer, the freedom to use what you want while still maintaining a core, well defined structure. This way you can still use Drizzle or Sequelize as you already using. At the same time [library maintainers like Lucia](https://github.com/lucia-auth/lucia/discussions/1707), don't need to recreate adapters for every ORM available, palmares will be the common abstraction above all. This specially useful when thinking on a framework level. We can create abstractions like Auth, Admin, Scaffolding, without needing to worry about which ORM or server you choose to use.

### What is palmares databases?

The [@palmares/databases](https://www.npmjs.com/package/@palmares/databases) package offers you a simple API to interact with databases. Manage Schemas, access your data, relate your data. Everything you would do on a normal database.

At its core it does nothing, at the same time it does everything!

With 0 dependencies at its core (even no dependency on Node), you don't need to worry if it'll work on Expo. Without an adapter this will simply not do anything. But with the adapter this package offers you the ability to generate migrations, query your data and offer a really nice way to interact with your database.

Although we kinda see ourselves as an ORM, we are not **data frameworks** as drizzle like to call others like Django or Spring. You are not forced to build your project around our structure, although we think this is preferable most of the times, you are still free to use it the way you want, on your own existing projects without any hassle or problem.

### Next Steps

- [Are you using to build applications?](https://github.com/palmaresHQ/palmares/tree/main/packages/databases/docs/doers/getting-started/introduction.md)
- [You want to integrate your library?](https://github.com/palmaresHQ/palmares/tree/main/packages/databases/docs/builders/getting-started/introduction.md)
