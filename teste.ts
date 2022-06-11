import logging from './packages/core/logging'
import { MessageCategories } from './packages/core/logging/types'

async function main() {
    logging.appendMessage("Teste", MessageCategories.Info, () => "teste")
    logging.logMessage("Teste")
}

main()