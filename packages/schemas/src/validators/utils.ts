import type { ValidatorTypes } from './types';
import type { ErrorCodes } from '../adapter/types';
import type Schema from '../schema/schema';
import type {
  ValidationFallbackCallbackReturnType,
  ValidationFallbackCallbackType,
  ValidationFallbackReturnType
} from '../schema/types';

const priorityByType = {
  low: 0,
  medium: 1,
  high: 2
};

const typeByPriority = Object.entries(priorityByType).reduce(
  (acc, [key, value]) => {
    acc[value] = key as ValidatorTypes;
    return acc;
  },
  {} as { [key: number]: ValidatorTypes }
);

/**
 * Okay, so what is this? This is a validator class, it represents a Node on a linked list. The linked list
 * has lower priority validators on the end of the list and higher priority validators on the start of the
 * list. Maybe in the future we can change that to a binary tree, but for now this is enough.
 *
 * Why did we choose this approach? Because what i was doing was that i saw myself repeating the same code 3
 * times on the schema in order to make the validation work. Each validator had  a different return type, i
 * didn't like that. I wanted to add more power and control on the validator, not on the schema. So i created
 * this class. So pretty much, over here and on each validator we can define the type it is. It can actually
 * be three: `low`, `medium` and `high`. The `low` validators are the ones that are going to be executed last,
 * The `high` validators are the ones that are going to be executed first. High validators validate if the value
 * is null or undefined, if it allows that. It can stop the execution of the other validators if it wants to.
 *
 * Example: Let's say that the value is null, if the value is null, is there a reason to check if it's a number?
 * No, right? So the high validator can stop the execution of the other validators.
 * Same as before, if the value is not a number, is there a reason to check if it's value is greater than the
 * `max` allowed 10? No, right? So the medium validator can stop the execution of the other validators.
 *
 * That's what this solve, it's a better approach than repeating the same code 3 times on the schema. It's also
 * more powerful, because if we need to add any extra priorities we can do that easily without changing the schema.
 */
export default class Validator {
  child?: Validator;
  parent?: Validator;
  fallbackNamesAdded = new Set();
  priority: number;
  fallbacks: ((
    value: any,
    path: (string | number)[],
    options: Parameters<Schema['__transformToAdapter']>[0]
  ) => Promise<{
    parsed: any;
    errors: {
      isValid: boolean;
      code: ErrorCodes;
      message: string;
      path: (string | number)[];
    }[];
    preventChildValidation?: boolean;
  }>)[] = [];

  constructor(type: ValidatorTypes) {
    this.fallbackNamesAdded = new Set();
    this.fallbacks = [];
    this.priority = priorityByType[type];
  }

  /**
   * We create all of the validators on the schema in order, i actually didn't want to go on that route but i
   * found it easier to do so.
   *
   * The logic here is simple, if it's not the same priority we will walk on the linked list until we find
   * a validator that matches the priority we are expecting. If we can't walk anymore, we create the next
   * priority validator and append it to the linked list. Be aware that it's a double linked list, so we
   * can walk both ways, from the end to the start and from the start to the end.
   * So you don't really need to start from the root, the linked list can start from anywhere and it will
   * find it's way through.
   *
   * I know there are better ways to do this instead of walking through the linked list, but like i explained
   * before, this is enough for now.
   *
   * If the priority is higher than the current priority saved on the schema, we should substitute the
   * rootValidator on the schema with the new one.
   *
   * @param schema - The schema that we are working on right now, all fallbacks are tied to that specific schema.
   * @param type - The type of the fallback that we are adding.
   * @param fallback - The fallback function that we are adding.
   * @param childOrParent - If we are adding a fallback to the child or to the parent.
   * @param options - The options that we are passing to the fallback.
   */
  private checkAppendOrCreate(
    schema: Schema,
    type: ValidatorTypes,
    fallbackName: string,
    fallback: ValidationFallbackCallbackType,
    childOrParent: 'child' | 'parent',
    options?: Parameters<(typeof Validator)['createAndAppendFallback']>[2]
  ) {
    const schemaWithProtected = schema as Schema & { __rootFallbacksValidator?: Schema['__rootFallbacksValidator'] };

    if (this[childOrParent])
      (this as any)[childOrParent].addFallback(schemaWithProtected, type, fallbackName, fallback, options);
    else {
      const nextPriority = childOrParent === 'child' ? this.priority - 1 : this.priority + 1;
      if (Object.keys(typeByPriority).includes(String(nextPriority))) {
        const nextType = typeByPriority[nextPriority];

        const validatorInstance = new Validator(nextType);
        this[childOrParent] = validatorInstance;
        (this as any)[childOrParent][childOrParent === 'parent' ? 'child' : 'parent'] = this;
        (this as any)[childOrParent].addFallback(schemaWithProtected, type, fallbackName, fallback, options);
        if (nextPriority > schemaWithProtected.__rootFallbacksValidator.priority)
          schemaWithProtected.__rootFallbacksValidator = validatorInstance;
      }
    }
  }

  addFallback(
    schema: Schema,
    type: ValidatorTypes,
    fallbackName: string,
    fallback: ValidationFallbackCallbackType,
    options?: Parameters<(typeof Validator)['createAndAppendFallback']>[2]
  ) {
    if (this.fallbackNamesAdded.has(fallbackName) && options?.removeCurrent !== true) return;
    this.fallbackNamesAdded.add(fallbackName);
    const priority = priorityByType[type];
    if (this.priority === priority) {
      if (typeof options?.at === 'number')
        this.fallbacks.splice(options.at, options.removeCurrent === true ? 1 : 0, fallback);
      else this.fallbacks.push(fallback);
    } else if (priority > this.priority)
      this.checkAppendOrCreate(schema, type, fallbackName, fallback, 'parent', options);
    else if (priority < this.priority) this.checkAppendOrCreate(schema, type, fallbackName, fallback, 'child', options);
  }

  /**
   * Validates the value against all of the fallbacks, the fallbacks are executed in order, from the highest
   * priority to the lowest priority. A validator can stop the execution of the other validators if it feels
   * like so. Like on the example of a value being null or undefined.
   *
   * @param errorsAsHashedSet - This is a set that contains all of the errors that we already found, this is
   * used to avoid duplicated errors.
   * @param path - The path that we are validating right now.
   * @param parseResult - The result of the parsing, it contains the parsed value and the errors that we found.
   * @param options - The options that we are passing to the fallback.
   */
  async validate(
    errorsAsHashedSet: Set<string>,
    path: ValidationFallbackCallbackReturnType['errors'][number]['path'],
    parseResult: {
      errors: undefined | ValidationFallbackCallbackReturnType['errors'];
      parsed: any;
    },
    options: Parameters<Schema['__transformToAdapter']>[0]
  ): Promise<ValidationFallbackCallbackReturnType> {
    let doesItShouldPreventChildValidation = false;

    for (const fallback of this.fallbacks) {
      const { parsed, errors, preventChildValidation } = await fallback(parseResult.parsed, path, options);
      parseResult.parsed = parsed;
      for (const error of errors) {
        if (error.isValid === false) {
          const sortedError = Object.fromEntries(Object.entries(error).sort(([a], [b]) => a.localeCompare(b)));

          const hashedError = JSON.stringify(sortedError);
          if (errorsAsHashedSet.has(hashedError)) continue;
          errorsAsHashedSet.add(hashedError);
          if (!Array.isArray(parseResult.errors)) parseResult.errors = [];
          parseResult.errors.push({
            ...error,
            received: parseResult.parsed
          });
        }
      }
      doesItShouldPreventChildValidation = doesItShouldPreventChildValidation || preventChildValidation || false;
    }

    if (this.child && doesItShouldPreventChildValidation === false)
      return this.child.validate(errorsAsHashedSet, path, parseResult, options);

    return parseResult as unknown as Promise<ValidationFallbackCallbackReturnType>;
  }

  /**
   * This static method takes care of everything for you. This means that you should only call this method
   * for appending new fallbacks, it takes care of creating the root validator and making sure that the
   * rootValidator on the schema is the highest priority one.
   *
   * @param schema - The schema that we are working on right now, all fallbacks are tied to that specific
   * schema. We automatically define the rootValidator on the schema so you don't need to worry about that.
   * @param fallback - The fallback that we are adding. This is an object that contains the type of the
   * fallback and the callback that we are adding.
   * @param options - The options that we are passing to the fallback. Options like `at` and `removeCurrent`
   * are passed to the `addFallback` method.
   */
  static createAndAppendFallback(
    schema: Schema<any, any>,
    fallback: ValidationFallbackReturnType,
    options?: {
      at?: number;
      removeCurrent?: boolean;
    }
  ) {
    const schemaWithProtected = schema as Schema & { __rootFallbacksValidator?: Schema['__rootFallbacksValidator'] };

    let validatorInstance = schemaWithProtected.__rootFallbacksValidator;
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (schemaWithProtected.__rootFallbacksValidator === undefined) {
      validatorInstance = new Validator(fallback.type);
      schemaWithProtected.__rootFallbacksValidator = validatorInstance;
    }
    validatorInstance.addFallback(schema, fallback.type, fallback.name, fallback.callback, options);
    return validatorInstance;
  }

  toString(ident = 0): string {
    return `Priority: ${this.priority}\nFallbacks: ${this.fallbacks.length}\n${
      this.child ? `Children:\n${this.child.toString(ident + 2)}` : ''
    }`;
  }
}
