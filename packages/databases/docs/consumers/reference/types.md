[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/summary.md) >
[types](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/types.md)

# Reference > Types

The palmares engine is fully type-safe, or tries to be, on the most part. The goal for us was to build it with type-safety in mind when designing the APIs. The thing is, although we generate the types for you as you write code, you might need to reuse it through the codebase.

You built your shiny new QuerySet, but want to get the type from it to properly type the expected attribute of a function. Or you have a model and want to extract what would the input be or output on a type level so you can build your Schema around it.

We have generic types that covers almost all use cases.
