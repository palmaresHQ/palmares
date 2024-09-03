import type { serverDomainModifier } from '.';
import type { Domain, ExtractModifierArguments } from '@palmares/core';

export type ServerDomain = Domain<[typeof serverDomainModifier]> &
  Partial<ExtractModifierArguments<[typeof serverDomainModifier]>>;
