// @ts-nocheck
import { path, pathNested } from '@palmares/server';

import { healthCheckController } from './controllers';

export const baseRoute = path('/core')
/**
 * Type-safe nested route. This route now "knows" on type-level that it's nested under `baseRoute`.
 */
export const healthCheckRoute = pathNested<typeof baseRoute>()('/health-check')

/**
 * This is the final route that will be used by the server.
 *
 * You might ask **WHY NOT JUST DO IT LIKE THIS?**
 *
 * ```ts
 * export default path('/core').nested([path('/health-check').nested([healthCheckController])])`
 * ```
 *
 * This will work, but will not preserve type-safety. For the MVC pattern you want to easily import the type for your routes
 * on your controllers to preserve type-safety.
 */
export default baseRoute.nested([healthCheckRoute.nested([healthCheckController])])
