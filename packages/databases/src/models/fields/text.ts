import Field from './field';
import type { This } from '../../types';
import type { TextFieldParamsType } from './types';

export default class TextField<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> extends Field<F, D, U, N, A, CA> {
  type!: string;
  typeName: string = TextField.name;
  allowBlank: boolean;

  constructor(params: TextFieldParamsType<F, D, U, N, A, CA>) {
    super(params);
    this.allowBlank =
      typeof params.allowBlank === 'boolean' ? params.allowBlank : true;
  }

  static new<
    I extends This<typeof TextField>,
    D extends N extends true
      ? InstanceType<I>['type'] | undefined | null
      : InstanceType<I>['type'] | undefined = undefined,
    U extends boolean = false,
    N extends boolean = false,
    A extends boolean = false,
    CA = any
  >(
    this: I,
    params: TextFieldParamsType<InstanceType<I>, D, U, N, A, CA> = {}
  ) {
    return new this(params) as TextField<InstanceType<I>, D, U, N, A, CA>;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}allowBlank: ${this.allowBlank},` + customParamsString
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsText = field as TextField;
    return (
      (await super.compare(field)) && fieldAsText.allowBlank === this.allowBlank
    );
  }

  async constructorOptions(field?: TextField) {
    if (!field) field = this as TextField;
    const defaultConstructorOptions = await super.constructorOptions(field);
    return {
      ...defaultConstructorOptions,
      allowBlank: field.allowBlank,
    };
  }
}
