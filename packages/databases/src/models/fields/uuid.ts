import CharField from './char';
import Field from './field';
import type { This } from '../../types';
import type { UUIDFieldParamsType } from './types';
import TextField from './text';

export default class UUIDField<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any,
  AG extends boolean = false
> extends CharField<F, D, U, N, AG extends true ? true : A, CA> {
  type!: string;
  typeName: string = UUIDField.name;
  autoGenerate: AG;

  constructor(params: UUIDFieldParamsType<F, D, U, N, A, CA, AG> = {}) {
    super({
      maxLength: 36,
      isAuto: (typeof params.autoGenerate === 'boolean'
        ? params.autoGenerate
        : false) as AG extends true ? true : A,
      ...params,
    });
    this.autoGenerate =
      typeof params.autoGenerate === 'boolean'
        ? params.autoGenerate
        : (false as AG);
  }

  static new<
    I extends This<typeof TextField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any,
    AG extends boolean = false
  >(
    this: I,
    params: UUIDFieldParamsType<InstanceType<I>, D, U, N, A, CA, AG> = {}
  ) {
    return new this(params) as UUIDField<InstanceType<I>, D, U, N, A, CA, AG>;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}autoGenerate: ${this.autoGenerate},${customParamsString}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsUUID = field as UUIDField;
    return (
      (await super.compare(field)) &&
      fieldAsUUID.autoGenerate === this.autoGenerate
    );
  }

  async constructorOptions(field?: UUIDField) {
    if (!field) field = this as UUIDField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      autoGenerate: field.autoGenerate,
    };
  }
}
