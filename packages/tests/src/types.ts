import type { TestAdapter } from './adapter';
import type { testDomainModifier } from './domain';
import type { Domain, ExtractModifierArguments, SettingsType2 } from '@palmares/core';

export type AllTestsSettingsType = SettingsType2 & TestsSettingsType;

export type TestsSettingsType = {
  testAdapter: typeof TestAdapter;
};

export type TestDomain = Domain & Partial<ExtractModifierArguments<[typeof testDomainModifier]>>;

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Palmares {
    interface PTestAdapter {}
  }
}
