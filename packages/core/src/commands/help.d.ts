import { Domain } from '../domain';
import { ExtractCommandsType } from './types';
import type coreDomain from '../domain/default';
/**
 * The help command is used to show the user all of the available commands and their respective descriptions.
 *
 * You can also use to show
 */
export default function help(domains: Domain[], keywordArgs?: ExtractCommandsType<typeof coreDomain, 'help'>['keywordArgs']): void;
//# sourceMappingURL=help.d.ts.map