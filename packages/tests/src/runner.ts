import { initializeDomains } from '@palmares/core'

import { setTestAdapter } from './utils'
import { AllTestsSettingsType } from './types'

export default async function run(settingsPath: string) {
  const settings = await import(settingsPath)
  const { settings: allSettings } = await initializeDomains(settings.default)
  const testSettings = allSettings as AllTestsSettingsType;
  const adapterInstance = new testSettings.testAdapter()
  setTestAdapter(adapterInstance)

}
