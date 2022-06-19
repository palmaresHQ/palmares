import Engine from "../engine";
import { ModelAttributesType, ModelOptionsType } from "./types";
import * as fields from "./fields";


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
export default class Model {
    attributes!: ModelAttributesType;
    options?: ModelOptionsType;
    abstracts: Model[] = [];

    static instances = new Map<string, Model>();

    readonly _defaultOptions = {
        autoId: true,
        primaryKeyField: new fields.BigAutoField(),
        abstract: false,
        underscored: true,
        tableName: null,
        managed: true,
        ordering: [],
        indexes: [],
        databases: ['default'],
        customOptions: {}
    }

    async init(model: typeof Model, engineInstance: Engine) {
        throw new Error("Method not implemented.");
    }
}