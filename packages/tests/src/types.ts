import type { SettingsType2, Domain, ExtractModifierArguments } from '@palmares/core';

import type TestAdapter from './adapter';
import type { testDomainModifier } from './domain';

export type AllTestsSettingsType = SettingsType2 & TestsSettingsType

export type TestsSettingsType = {
  testAdapter: typeof TestAdapter;
};

export type TestDomain = Domain & Partial<ExtractModifierArguments<[typeof testDomainModifier]>>;
