import { DomainHandlerFunctionArgs } from '../commands/types';
import { CoreSettingsType } from '../conf/types';
declare const coreDomain: {
    new (): {
        load: (_: CoreSettingsType) => Promise<undefined>;
        ready: (args: import("./types").DomainReadyFunctionArgs<unknown, any>) => void | Promise<void>;
        close: (() => void | Promise<void>) | undefined;
        commands: {
            help: {
                description: string;
                positionalArgs: undefined;
                keywordArgs: {
                    command: {
                        description: string;
                        hasFlag: true;
                        type: "string";
                        canBeMultiple: true;
                    };
                    domain: {
                        description: string;
                        hasFlag: true;
                        type: "string";
                        canBeMultiple: true;
                    };
                };
                handler: (options: DomainHandlerFunctionArgs) => void;
            };
        } | undefined;
        name: string;
        path: string;
        isLoaded: boolean;
        modifiers: object;
        __isReady: boolean;
        __isClosed: boolean;
    };
    __instance: import("./domain").default<any>;
};
export default coreDomain;
//# sourceMappingURL=default.d.ts.map