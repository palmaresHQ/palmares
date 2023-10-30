---
'@palmares/sequelize-engine': patch
'@palmares/databases': patch
---

This introduces better documentation for database adapter methods/classes and added some new methods to some database adapters like the option to parse the result of the database. We tried the "OR" operator inside the query but decided to keep the way it is. We would need to bring too much change to the adapters
