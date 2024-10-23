# Getting Started > Introduction

We really hope you already read the [Consumer docs](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/summary.md). Yeah, I would not have read it either, who got time for reading 2 docs?

This documentation will get you started in palmares databases like you don't even know what it is about.

## What is this shit?

You already know what Palmares is. Palmares databases is part of it and as the name suggests it deals only with databases. The idea of it is to give users (or we can refer them as **app builders**, or even **consumers**) a single interface to interact with databases. This way we can offer, through the framework, solutions for Auth, Admin pages, Cron Jobs management, etc without needing to know beforehand which ORM the user has chosen to use. Lucia, a popular Auth library had this problem in the past. They offered an interface that maps to common actions, for example, retrieving users. They needed to document how the database tables should be built and offer adapter for most popular ORMs at the time.

As you can see we still kinda need to do that as well, but right now our focus shift for offering support just to the ORMs, with that the community is free.
