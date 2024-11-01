<p align="center">
  <a target="blank"><img src="https://github.com/palmaresHQ/palmares/blob/main/resources/Palmares.png" width="120" alt="Palmares Logo" /></a>
</p>
<p align="center">
A <a href="http://nodejs.org" target="_blank">Javascript</a> and <a href="typescriptlang.org" target="_blank">Typescript</a> framework aimed at unification.</p>

<br />

<p align="center">
  <a title="MIT license" target="_blank" href="https://github.com/palmaresHQ/palmares/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-mustard?style=flat-square"></a>
  <a title="Coverage" target="_blank" href="ttps://github.com/palmaresHQ/palmares/blob/main/examples"><img alt="Coverage" src="https://img.shields.io/badge/coverage-trust_me_bro-green?style=flat-square"></a>
  <a title="Blazingly fast" target="_blank" href="https://twitter.com/acdlite/status/974390255393505280"><img src="https://img.shields.io/badge/blazingly-slow-red?style=flat-square"/></a>
</p>

## Description

**Palmares** is a framework that aims for unification and freedom. It's opinionated at the same time it's not. Bring your own tools, forget thinking if X works with Y. With Palmares it just works! You can use it even without a server!

You can also strip the hole framework apart and just use what you need from it on your projects. You don't need to use Palmares to use Palmares!

It's aimed to work well on monorepos and have **ZERO** dependencies at it's core. Where javascript runs, this framework is supposed to run as well. **Even on places where javascript is definitely the worst language choice!**

## Motivation

The name of this framework is a tribute to Zumbi dos Palmares, a Brazilian hero who fought against the portuguese for the freedom of slaves in Brazil. A Quilombo was a place were the people who scaped slavery could go to live free in a community. This framework aims not to be yet another replacement tool or framework, but a framework that unify all JS ecosystem into one. It's about union and freedom of choosing what you want to use.

Every single day a hole bunch of time needs to be spent dealing with the complexity of making libraries work together. You just spent 3 full weeks trying to make your ORM work with your schema validator, guess what? Seems that a new ORM solution just came out yesterday.

With **Palmares** we can unify all the ecosystem into one by worrying in 2 fronts:

- How to make the framework easy to use
- How to make the framework easy to extend

<p align="center">
  <img src="https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/resources/xkcd-standards.png" width="180" alt="XKCD comic joking about standards, but modified to say the only standard is palmares" />
</p>

> Now cut the trash talk

The motivation is that we had nothing better to do. And Palmares is because we thought it would be a cool name, what did you expect? Also I write in third person because if this project start receiving contributions from maintainers we don't need to change first to third person. I'm a nice person, you know? Or we?

### How does it differ from the others

- [Redwood.js](https://redwoodjs.com/), [wasp-lang](https://wasp-lang.dev/), [t3stack](https://create.t3.gg/), etc. Although great ways to create applications they can be categorized more on the template side of things. It's built around a set of tools in mind. React, some of them uses Prisma, some uses drizzle. They are all heavily opinionated on the tools you should use. **Palmares** is not opinionated at all, we go deep into creating an abstraction layer that can be used with all existing ORMs, servers, Schema validators. We are the common _glue_ above all. And another thing: You can still use everything we give you independent from the framework, we are don't have any financial incentive to make you vendor-locked-in on our framework. Pick what you like and just use.
- [Nest.js](https://nestjs.com/) An amazing piece of software, but I know you don't like Angular, neither do I. Decorators are still non native to Javascript and Nest relies a lot on it. But still, we are grateful for Nest existence because it gave us some nice ideas.
- [Adonis.js](https://adonisjs.com/) What we are trying to accomplish, but instead of doing everything ourselves we rely on popular libraries like Express, Drizzle, Zod, etc. We are not trying to substitute them but work alongside them.
- [Encore.js](https://encore.dev/) Kinda the same thing as Adonis. It's more like a Development Platform, as they sell it, than a framework.
- [Supabase](https://supabase.com/) and [Strapi](https://strapi.io/) have a nice UI to build backend applications. We differ a lot from them.

### When NOT to use Palmares

> When you have skill issues, mostly

But also

- You dream with Angular or think Javascript should be less _Script_ and more _Java_: [Nest.js](https://nestjs.com/)
- You just want to build your shiny new MVP with an opinionated set of tools you are familiar: [Redwood.js](https://redwoodjs.com/), [wasp-lang](https://wasp-lang.dev/), [t3stack](https://create.t3.gg/)
- You don't want to rely on third party, and want the full package: [Adonis.js](https://adonisjs.com/) or [Encore.js](https://encore.dev/)
- You think that the Mouse is better than the Keyboard and you hate Code Editors in general: [Supabase](https://supabase.com/) and [Strapi](https://strapi.io/)

## Getting Started and Documentation

Real developers code looking at the source code. But for you newbies out there, it's coming soon...

## Issues

Guarantee that your issue follow our [code of conduct](https://github.com/palmaresHQ/palmares/blob/main/CODE_OF_CONDUCT.md) guidelines before posting. All issues that does not follow our Code of Conduct will be closed and ignored.

## Discussions and Help

Use [our discussions tab](https://github.com/palmaresHQ/palmares/discussions) for help and questions. We will be glad to help you out.

## F.A.Q.

- **Cool project!**: Thank you.
- **Can I use it with typescript?**: Yes, you can.
- **Where did you got the inspiration?**: From Django and Rails, mostly. But they have lots of stuff, i want to make a more open and customizable version where you can use the tools you already use and love.
- **Can I contribute?**: Yes, please do. We will be glad to have you on board.
- **Can I use it in production?**: Not yet, we are still in early development.
- **Can I use it in my company?**: Yes, you will be promoted if you use it.
- **Does it work with X?**: Hopefully yes, if not, please open an issue.
- **Can I use it with my favorite ORM?**: Yes, you can use it with any ORM you want.
- **Does it support ~the Edge?~**: Sadly it does not support edging at this given moment.
- **REWRITE IN RUST!!!**: Yes, you can create adapters in rust, it's one of my ideas.
- **Don't you care about performance?**: Yes, we do, but we care more about you having more time to spend with your family (Developer Experience)
- **When will it be ready?**: When it's ready.
- **EW, JS, WHY NOT JAVA?**: But it's Java.
- **I don't like it**: I'm sorry to hear that, but you'll need to live and deal with our existence.
- **I love it**: Thank you, we love you too.
