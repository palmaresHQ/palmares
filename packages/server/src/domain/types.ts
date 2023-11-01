import { Domain, ExtractModifierArguments } from '@palmares/core';

import { serverDomainModifier } from '.';

export type ServerDomain = Domain & Partial<ExtractModifierArguments<[typeof serverDomainModifier]>>;
