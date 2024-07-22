import type { serverDomainModifier } from '.';
import type { Domain, ExtractModifierArguments } from '@palmares/core';

export type ServerDomain = Domain & Partial<ExtractModifierArguments<[typeof serverDomainModifier]>>;
