const defaultInstalledApps : string[] = [];

export default {
    BASE_PATH: '.',
    ADAPTER: '@palmares/express-adapter',
    ROOT_URLCONF: '',
    PORT: 4000,
    SECRET_KEY: 'secret',
    ENV: ![null, undefined, ''].includes(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development',
    DEBUG: true,
    APP_NAME: 'palmares',
    INSTALLED_APPS: defaultInstalledApps,
    LOGGING: {},
    DATABASES: {},
}