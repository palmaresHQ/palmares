import App from '../app'
import Configuration from '../conf';

export default async function devCommandHandler(args: string[]) {
    const app = new App(Configuration.settings);
    const server = await app.run();
}