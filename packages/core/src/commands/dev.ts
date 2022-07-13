import App from '../app'
import { SettingsType } from '../conf/types';
import { DomainHandlerFunctionArgs } from './types';

export default async function devCommandHandler({
  settings, domains
}: DomainHandlerFunctionArgs) {
    const app = new App(settings as SettingsType);
    await app.run(domains);
}
