import Engine from "../engine";
import {
  ModelFieldsType,
  ModelOptionsType,
  ModelType,
  ManagersOfInstanceType
} from "./types";
import {
  ModelCircularAbstractError,
  ModelInvalidAbstractFieldError,
  ModelInvalidAbstractManagerError
} from "./exceptions";
import { Field } from "./fields";
import { BigAutoField } from "./fields";
import Manager from "./manager";
import { DatabaseSettingsType } from "../types";
import { EngineType } from "../engine/types";

/**
 * This class is used for initializing a model. This will work similar to django except that instead of
 * `objects` we use `instance` to make queries. So in other words, if you want to make queries directly
 * you will need to use. Also the instance will hold the actual instance of the model.
 *
 * >>> ModelName.getInstance().findOne()
 * or
 * >>> ModelName.getInstance().create()
 *
 * and so on.
 *
 * For creating Models it is simple, you've got 4 objects: `attributes`, `objects`, `managers` and `abstracts`
 *
 * The first one is obligatory, the rest is optional.
 * For `attributes` it is simple, just define the attributes of your model there as you would in sequelize
 * normally:
 *
 * Example:
 * In sequelize we define like:
 * >>> sequelize.define('User', {
 *      firstName: {
 *          type: DataTypes.STRING,
 *          allowNull: false
 *      },
 *      lastName: {
 *          type: DataTypes.STRING
 *      }
 * }, {
 *      tableName: 'user'
 * })
 *
 * Notice that 'User' is the name of the model, the second argument of the `.define()` function is the attributes,
 * it is exactly this object we will put in the attributes parameter. The second argument of the function is the
 * sequelize `options` sequelize parameter where we can define indexes, tableName and many other configuration.
 * You might want to check sequelize documentation for this: https://sequelize.org/master/manual/model-basics.html
 *
 * Okay so how do we rewrite this to something more concise and readable?
 * class User extends Model {
 *      attributes = {
 *          firstName: new model.fields.CharField(),
 *          lastName: new model.fields.CharField()
 *      }
 *
 *      options = {
 *          tableName: 'user'
 *      }
 *
 *      getFullName() {
 *          return this.firstName + this.lastName
 *      }
 *
 *      custom = new CustomManager()
 * }
 *
 * Simple and elegant. You will notice the `attributes` is defined, the options is optional, so instead of defining an
 * empty object you can totally omit it if you want.
 *
 * The `.getFullName` function is an instance function it will be appended to the instance so you can make a query like
 * and then it will return an User model, this model will have the method.
 *
 * >>> const response = await User.instance.findOne()
 * >>> response.getFullName()
 *
 * We underline many stuff from sequelize so you, the programmer, don't need to worry about tooling, it will just work.
 *
 * Take a notice at manager. Manager is for building custom managers similar to django managers.
 * Instead of making queries through your code you can keep all of your queries inside of managers and just
 * define them in your model.
 *
 * For the CustomManager, this will be our definition of a custom manager
 * >>> class CustomManager extends Manager {
 *         createUser(firstName, lastName) {
 *              return this.instance.create({ firstName: firstName, lastName: lastName })
 *         }
 *     }
 *
 * Okay so now we don't need to create a new user calling `.create` directly, instead we can use
 *
 * User.custom.createUser('Jane', 'Doe')
 *
 * This way we can keep queries more concise and representative by just making functions. Also
 * you can have the hole power of linting VSCode and other IDEs give you.
 */
export default class Model implements ModelType {
  [managers: string]: Manager;
  fields: ModelFieldsType = {};
  options!: ModelOptionsType;
  abstracts: typeof Model[] = [];
  name!: string;

  static instances: ModelType["instances"]

  readonly #defaultOptions = {
    autoId: true,
    primaryKeyField: new BigAutoField({ primaryKey: true }),
    abstract: false,
    underscored: true,
    tableName: undefined,
    managed: true,
    ordering: [],
    indexes: [],
    databases: ['default'],
    customOptions: {}
  }

  /**
   * Retrieves the managers from a instance, by default the instance we retrieve is the current model
   * instance but since this function is used in the `#initializeAbstracts` function we can
   * pass a different instance.
   */
  async #getManagers(instance: Model = this): Promise<ManagersOfInstanceType> {
    let managers: ManagersOfInstanceType = {};
    const entriesOfInstance = Object.entries(instance);
    for (const [key, value] of entriesOfInstance) {
      if (value instanceof Manager) {
        managers[key] = value;
      }
    }
    return managers;
  }


  async #loadAbstract(abstractKls: typeof Model, composedAbstracts: string[]): Promise<void> {
    if (composedAbstracts.includes(abstractKls.name)) {
      throw new ModelCircularAbstractError(this.constructor.name, abstractKls.name);
    }

    const abstractInstance = new abstractKls();
    const abstractManagers: [string, Model][] = Object.entries(this.#getManagers(abstractInstance));
    const abstractFieldEntries = Object.entries(abstractInstance.fields);
    const loadAbstractPromises = abstractInstance.abstracts.map(
      (abstractKlsFromAbstract) => this.#loadAbstract(abstractKlsFromAbstract, composedAbstracts)
    );

    for (const [fieldName, field] of abstractFieldEntries) {
      if (this.fields[fieldName]) {
        throw new ModelInvalidAbstractFieldError(this.constructor.name, abstractKls.name, fieldName);
      }
      this.fields[fieldName] = field;
    }

    if (this.options === undefined && abstractInstance.options) {
      this.options = abstractInstance.options;
      this.options.abstract = false;
    }

    for (const [managerName, managerInstance] of abstractManagers) {
      if (this[managerName]) {
        throw new ModelInvalidAbstractManagerError(
          this.constructor.name, abstractKls.name, managerName
        );
      }
      this[managerName] = managerInstance;
    }

    await Promise.all(loadAbstractPromises);
  }

  async #initializeAbstracts(): Promise<void> {
    const alreadyComposedAbstracts = [this.constructor.name];
    for (const abstractModel of this.abstracts) {
      this.#loadAbstract(abstractModel, alreadyComposedAbstracts);
    }
  }

  async #initializeFields(engineInstance: Engine) {
    const allFields = Object.entries(this.fields);
    const promises = allFields.map(([fieldName, field]) => {
      return field.init(engineInstance, fieldName, this);
    })
    await Promise.all(promises);
  }

  async #initializeOptions() {
    this.options = {
      ...this.#defaultOptions,
      ...this.options
    };
    const doesModelHaveAutoIdField = this.options.autoId && this.options.primaryKeyField
    if (doesModelHaveAutoIdField) {
      const primaryKeyFieldInstance = this.options.primaryKeyField as Field;
      this.fields = {
        id: primaryKeyFieldInstance,
        ...this.fields
      };
    }
  }

  async #initializeManagers() {

  }

  async init(modelKls: typeof Model, engineInstance: Engine, customModelName?: string | undefined) {
    this.name = customModelName || modelKls.name;
    const databaseConnectionName = engineInstance.databaseName;
    await this.#initializeAbstracts();
    await this.#initializeOptions();
    await this.#initializeFields(engineInstance);
    await engineInstance.initializeModel(this);
  }
}
