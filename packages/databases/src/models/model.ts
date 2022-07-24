import Engine from "../engine";
import {
  ModelFieldsType,
  ModelOptionsType,
  ModelType,
  ModelFields,
  ManagersOfInstanceType,
  TModel
} from "./types";
import {
  ModelCircularAbstractError,
  ModelInvalidAbstractFieldError,
  ModelInvalidAbstractManagerError,
  ModelNoUniqueFieldsError
} from "./exceptions";
import { Field } from "./fields";
import { BigAutoField } from "./fields";
import Manager, { DefaultManager } from "./manager";
import databases from "../databases";
import { fields } from ".";

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

export class Model<T = any> {
  [managers: string]: Manager | ModelFieldsType |
    ModelOptionsType<T extends Model ? T : this> | typeof Model[] | string | string[] | boolean | Function;
  fields: ModelFieldsType = {
    id: new fields.AutoField()
  };
  _fields!: ModelFields<T extends Model ? T : this>;
  _isState: boolean = false;
  _dependentOnModels: string[] = [];
  options!: ModelOptionsType<T extends Model ? T : this>;
  abstracts: typeof Model[] = [];
  name!: string;
  originalName!: string;
  domainName!: string;
  domainPath!: string;

  static readonly defaultOptions = {
    abstract: false,
    underscored: true,
    tableName: undefined,
    managed: true,
    ordering: [],
    indexes: [],
    databases: ['default'],
    customOptions: {}
  }

  constructor() {
    if (this.options?.abstract) this.options.managed = false;
  }

  /**
   * Retrieves the managers from a instance, by default the instance we retrieve is the current model
   * instance but since this function is used in the `#initializeAbstracts` function we can
   * pass a different instance.
   *
   * @param instance - maybe you don't want to retrieve the managers from this instance, so you can
   * pass another one.
   */
  async #getManagers(instance: Model = this): Promise<ManagersOfInstanceType> {
    let managers: ManagersOfInstanceType = {};
    let prototype = instance.constructor;
    while (prototype) {
      if (!(prototype.prototype instanceof Model)) break;
      const propertyNamesOfModel = Object.getOwnPropertyNames(prototype);
      for (const propName of propertyNamesOfModel) {
        const value = (prototype as any)[propName];
        if (value instanceof Manager) {
          managers[propName] = value;
        }
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return managers;
  }

  /**
   * This will load all of the abstract instances of the model. The abstracts will append 3 types of
   * data in the current model:
   * fields, options, managers and other abstracts
   *
   * So for fields we will just accept the ones not already defined in the field, if there is any clash we will throw an error.
   * For options, we will only add them if the options are not already defined for the model.
   * Managers are similar to fields, we will not accept clashing managers with the same manager name.
   *
   * @param abstractKls - The model class that we are instantiating.
   * @param composedAbstracts - We can have an abstract with an abstract and so on, for that a recursive approach
   * seems a good solution, this is an array with all of the abstracts that were already loaded for the current model.
   */
  async #loadAbstract(abstractKls: typeof Model, composedAbstracts: string[]): Promise<void> {
    if (composedAbstracts.includes(abstractKls.name)) {
      throw new ModelCircularAbstractError(this.constructor.name, abstractKls.name);
    }

    const abstractInstance = new abstractKls();
    const abstractManagers: [string, Manager][] = Object.entries(this.#getManagers(abstractInstance));
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

    const areAbstractInstanceOptionsDefined = Object.keys(abstractInstance.options).length > 1;
    if (this.options === undefined && areAbstractInstanceOptionsDefined) {
      this.options = abstractInstance.options
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

  /**
   * Initializes all of the abstract classes of the model and loads them to the current model.
   *
   * With this we will have the model with all of the fields, options and managers as the other abstracts.
   */
  async #initializeAbstracts(): Promise<void> {
    const alreadyComposedAbstracts = [this.constructor.name];
    for (const abstractModel of this.abstracts) {
      this.#loadAbstract(abstractModel, alreadyComposedAbstracts);
    }
  }

  async #initializeFields(engineInstance: Engine): Promise<void> {
    let modelHasNoUniqueFields = true;
    const allFields = Object.entries(this.fields);
    const promises = allFields.map(([fieldName, field]) => {
      if (field.unique) modelHasNoUniqueFields = false;
      return field.init(engineInstance, fieldName, this);
    })
    await Promise.all(promises);
    if (modelHasNoUniqueFields) {
      throw new ModelNoUniqueFieldsError(this.constructor.name);
    }
  }

  async #initializeOptions() {
    this.options = {
      ...Model.defaultOptions,
      ...this.options
    };
  }

  async #initializeManagers(engineInstance: Engine, modelInstance: any) {
    const managers: ManagersOfInstanceType = await this.#getManagers(this);
    const managerValues = Object.values(managers);

    for (const manager of managerValues) {
      manager._setModel(this);
      manager._setInstance(engineInstance.databaseName, modelInstance);
      manager._setEngineInstance(engineInstance.databaseName, engineInstance);
    }
  }

  async _init(
    modelKls: typeof Model | Function,
    engineInstance: Engine,
    domainName: string,
    domainPath: string
  ) {
    this.domainName = domainName;
    this.domainPath = domainPath;

    if (this._isState) {
      this.originalName = this.name;
      this.name = `State${this.name}`;
    } else {
      this.originalName = modelKls.name;
      this.name = modelKls.name;
    }

    await this.#initializeAbstracts();
    await this.#initializeOptions();
    await this.#initializeFields(engineInstance);

    const modelInstance = await engineInstance.initializeModel(this);
    await this.#initializeManagers(engineInstance, modelInstance);
    return modelInstance
  }

  /**
   * Compare this and another model to see if they are equal so we can create the migrations automatically for them. You see
   * that we do not compare the fields, for the fields we have a hole set of `CRUD` operations if something changes there.
   * So it doesn't matter if two models don't have the same set of fields, if the options are equal, then they are equal.
   *
   * @param model - The model to compare to the current model.
   *
   * @returns - Returns true if the models are equal and false otherwise.
   */
  async _compareModels(model: Model): Promise<boolean> {
    return this.options.abstract === model.options.abstract &&
      this.options.underscored === model.options.underscored &&
      this.options.tableName === model.options.tableName &&
      JSON.stringify(this.options.ordering) === JSON.stringify(model.options.ordering) &&
      JSON.stringify(this.options.indexes) === JSON.stringify(model.options.indexes) &&
      JSON.stringify(this.options.databases) === JSON.stringify(model.options.databases) &&
      JSON.stringify(this.options.customOptions) === JSON.stringify(model.options.customOptions)
  }

  static async _fieldsToString(
    indentation: number = 0,
    fields: ModelFieldsType
  ): Promise<string> {
    const allFields = Object.entries(fields);
    const ident = '  '.repeat(indentation);
    const fieldsIdent = '  '.repeat(indentation+1);

    const stringifiedFields = [];
    for (let i = 0; i < allFields.length; i++) {
      const fieldName = allFields[i][0]
      const field = allFields[i][1]
      const isLastField = i === allFields.length - 1;
      stringifiedFields.push(
        `${fieldsIdent}${fieldName}: ${
          (await field.toString(indentation + 1)).replace(new RegExp(`^${fieldsIdent}`), '')
        },${isLastField ? '' : '\n'}`
      );
    }
    return `${ident}{\n` +
      `${stringifiedFields.join('')}` +
      `\n${ident}}`;
  }

  static async _optionsToString(indentation: number = 0, options: ModelOptionsType) {
    const ident = '  '.repeat(indentation);
    const optionsIndent = '  '.repeat(indentation + 1);
    const newOptions = {
      ...this.defaultOptions,
      ...options
    }
    return `${ident}{\n` +
      `${optionsIndent}abstract: ${newOptions.abstract},\n` +
      `${optionsIndent}underscored: ${newOptions.underscored},\n` +
      `${optionsIndent}tableName: ${typeof newOptions.tableName === 'string' ?
        `"${newOptions.tableName}"` :
        newOptions.tableName
      },\n` +
      `${optionsIndent}managed: ${newOptions.managed},\n` +
      `${optionsIndent}ordering: [${newOptions.ordering ?
        newOptions.ordering?.map(field => `"${field as string}"`) :
          ''
        }],\n` +
      `${optionsIndent}indexes: [${newOptions.indexes ?
        newOptions.indexes?.map((dbIndex, i) =>
          `{ unique: ${dbIndex.unique}, fields: ${dbIndex.fields.map(field => `"${field}"`)} }` +
          `${i === (newOptions.indexes?.length || 1) - 1 ? '' : ',' }`) :
        ''}],\n` +
      `${optionsIndent}databases: [${newOptions.databases ?
        newOptions.databases?.map(database => `"${database}"`) :
        ''}],\n` +
      `${optionsIndent}customOptions: ${JSON.stringify(newOptions.customOptions)}\n` +
      `${ident}}`;
  }
}

export default function model<M>() {
  return class DefaultModel extends Model<M> {
    static default = new DefaultManager< M extends Model ? M : Model>()
  }
}

