# @palmares/server


## TODOs:
 - [X] Add support to translate middlewares
 - [ ] 80% test coverage.
 - [ ] Better typescript support for abstract models.
 - [ ] Model to instance and instance to Model (translates a raw object to something that the orm/database can understand and vice versa).
 - [ ] Dynamic imports for models (similar with the `customImports` function on fields)
 - [ ] Lazy load the models, so we can tackle environments like serverless or the edge with the framework. (For that we need to just load the basic part of the models, without translating, we will only translate when we need it. When we translate we must be sure the dependencies are translated first.) It won't be the fastest solution but it will work.
