import { This } from '../../types';
import Field from './field';
import TextField from './text';
import { CharFieldParamsType } from './types';

export default class CharField<
  F extends Field = any,
  D extends N extends true
    ? F['type'] | undefined | null
    : F['type'] | undefined = undefined,
  U extends boolean = false,
  N extends boolean = false,
  A extends boolean = false,
  CA = any
> extends TextField<F, D, U, N, A, CA> {
  typeName: string = CharField.name;
  maxLength: number;

  constructor(
    params: CharFieldParamsType<F, D, U, N, A, CA> = {
      maxLength: 255,
      allowBlank: true,
    }
  ) {
    super(params);

    const maxLength =
      typeof params.maxLength === 'number' ? params.maxLength : 255;
    const defaultValueAsString = params?.defaultValue as string;
    const isDefaultValueDefined: boolean =
      (defaultValueAsString === 'string' &&
        defaultValueAsString.length <= maxLength) ||
      defaultValueAsString === null;

    this.defaultValue = isDefaultValueDefined ? params.defaultValue : undefined;
    this.maxLength = maxLength;
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
    params: CharFieldParamsType<InstanceType<I>, D, U, N, A, CA> = {
      maxLength: 255,
      allowBlank: true,
    }
  ) {
    return new this(params) as CharField<InstanceType<I>, D, U, N, A, CA>;
  }

  async toString(
    indentation = 0,
    customParams: string | undefined = undefined
  ) {
    const ident = '  '.repeat(indentation + 1);
    const customParamsString = customParams ? `\n${customParams}` : '';
    return super.toString(
      indentation,
      `${ident}maxLength: ${this.maxLength},` + `${customParamsString}`
    );
  }

  async compare(field: Field): Promise<boolean> {
    const fieldAsText = field as CharField;
    return (
      (await super.compare(field)) && fieldAsText.maxLength === this.maxLength
    );
  }
}
