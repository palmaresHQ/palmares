# Welcome to the `@palmares/server` package contribution guide.

First, thank you for taking the time to contribute to the project. It means a lot for us.

This document is focused on contributing to the `@palmares/server` package. Please, make sure you understand the core concepts of the `@palmares/core` before contributing to this package.

**IMPORTANT**: This is a **CORE** package, it shouldn't contain any dependency besides devDependencies, need a node API? Don't use it directly, make sure to add `@palmares/std` as a dependency and make sure it's interfaces fit your needs. Need an event emitter? add `@palmares/events` as dependency. Needs database access? `@palmares/databases`.

## About Typescript

We use a lot of advanced typescript here. We use a LOT of types. Types, like functions, should contain documentation in them, what is it for? It's easy to get lost with typescript, specially if the project has A LOT of types.

If you are not familiar with typescript, please, take a look at the [official documentation](https://www.typescriptlang.org/docs/handbook/intro.html). And understand that lots of challenges we face on typescript can already have been solved on [type-challenges repo](https://github.com/type-challenges/type-challenges). See the problem and the solution and see if it somehow solves your problem.

I advice against using any type of namespace mangling. We should be writing types directly on the code.

## How the `@palmares/server` package is organized?

### Domain

First, everything starts in `domain` folder. This is where you will see everything regarding the domain definition, the commands that it supports and how the settings should be defined.
The most important command will return the `App` class. This class is the one that will be used to start the server.

If you read the `@palmares/core` you probably already know about that.

### Application

Then, the `app` folder is where you will find the App class. This is the class that is called to keep the server running. This class will contain a lifecycle to load all the routes, the middlewares and actually start the server. Most of the ACTUAL code is defined on `utils.ts` file.

### Adapter

Following the hole idea of the framework we need to define an adapter, you can see it on `adapters` folder. It has everything needed to parse the request and send the response, load the routes. It also has a `Server` class that is used to start the server.

Please, for most of the stuff Palmares should take care for everything, it is not because a framework author built a framework like Express.js that he wants to spend time writing an adapter. So make sure to keep it simple, just create a method if there is no other way to solve it. Also, remember that the user can and should, at any time, have access to the underlying framework extending it's functionality. We should not try to hide anything from the end user and for the adapter author.

### Router

The router is the one that will be used to define the routes. It is defined on `router` folder. The router uses the [Builder Pattern](https://refactoring.guru/design-patterns/builder). A router can also be a controller. We tried to offer the ability to also define routes by classes, but this will not offer proper typesafety so we decided to not support it (for now, maybe).

### Middlewares

Middlewares are defined on `middlewares` folder. They are just functions that receive a request and a response and return a promise. They can be used to do anything you want, but they are mostly used to parse the request and change the response.

### Request

The Request class is defined on `request` folder. It is used to parse the request and offer a more typesafe way to access the request data. It follows the MDN [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) interface definition. We also extend it with some other useful methods and data.

Something important: We want to make sure that this framework does not add too much overhead to the underlying framework, so we have decided to do everything lazy. Most of the properties are lazy, so they will only be parsed when you access them. This is important to keep in mind when you are writing a middleware or a router.

Also, it's important to give the user the ability to the underlying framework data. For example, on Express the user might want to access the `req` or `res` objects. So we should give this ability to the users.

### Response

The Response class is defined on `response` folder. It is used to change the response. It follows the MDN [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) interface definition. We also extend it with some other useful methods and data.

### Handlers, Defaults and Utils

#### Handlers

The handlers are defined on `handlers` folder. This is where you should keep your custom handler for the server (like for example the 500 handler). You can define a welcome page here and so on.

#### Defaults

The defaults are defined on `defaults` folder. This is where you should keep your constants, default middlewares, default settings and such.

#### Utils

The utils are defined on `utils` folder. This is where you should keep your utility functions. (FOR THE HOLE PROJECT, you can add a utils to Request, Response, Router, etc.)

## How to run?

You need to create a custom adapter, by default we use the `@palmares/express-adapter` but you can use any other adapter that you want. Then, just start testing and iterating if everything is working.

PLEASE, Make sure that the types are working as well.

## Documentation

Any User, or lib maintainer faced API should be documented. Sometimes you need to repeat yourself, but try to be as descriptive as possible.
