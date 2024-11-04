import fs from 'fs';

const appName = process.argv[2];
const runtime = process.argv[0];

const runtimeByPm = {
  deno: 'deno',
  bun: 'bun'
} as any;

if (!appName) {
  console.error('Please provide an app name');
  process.exit(1);
}

fs.mkdirSync(appName);

fs.writeFileSync(
  `${appName}/package.json`,
  JSON.stringify(
    {
      name: appName,
      version: '0.0.0',
      private: true,
      type: 'module',
      types: './dist/index.d.ts',
      main: './dist/manage.js',
      require: './dist/manage.cjs',
      scripts: {
        dev: 'tsx src/manage.ts runserver',
        build: 'tsup src/manage.ts',
        lint: 'eslint .',
        start: `${runtimeByPm[runtime] ? runtimeByPm[runtime] : 'node'} dist/manage.js`
      },
      dependencies: {
        '@palmares/core': 'latest',
        '@palmares/server': 'latest',
        '@palmares/databases': 'latest',
        '@palmares/sequelize-engine': 'latest'
      },
      devDependencies: {
        '@eslint/js': 'latest',
        eslint: 'latest',
        tsup: 'latest',
        typescript: 'latest',
        'typescript-eslint': 'latest',
        tsx: 'latest'
      }
    },
    null,
    2
  )
);

fs.mkdirSync(
  `${appName}/.gitignore`,
  `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
);

fs.mkdirSync(
  `${appName}/.gitignore`,
  `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
);
