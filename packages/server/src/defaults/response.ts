import Response from '../response';
import { AllServerSettingsType } from '../types';

import type { Domain } from '@palmares/core';

export const DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY = 'Content-Type';
export const DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON = 'application/json';
export const DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY = 'Location';
export const DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE = 'Not Found';
export const DEFAULT_SERVER_ERROR_STATUS_TEXT_MESSAGE = 'Internal Server Error';
export const DEFAULT_SERVER_ERROR_RESPONSE = (error: Error, settings: AllServerSettingsType, domains: Domain[]) => {
  const errorFileAndLines = error.stack?.split('\n')[1].match(/\((.*)\)/)?.[1];
  const errorFile = errorFileAndLines?.split(':')[0];
  const errorLine = errorFileAndLines?.split(':')[1];
  const errorColumn = errorFileAndLines?.split(':')[2];

  return new Response(
    `
    <head>
      <meta charset="utf-8">
      <title>[Palmares] - Internal Server Error</title>
      <link href="https://fonts.googleapis.com/css?family=Mooli" rel="stylesheet">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs/loader.min.js"></script>
      <script>
      require.config({
        paths: {
          vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs',
        },
      });

      const sourceCode = \`${JSON.stringify(settings, null, 2)}\`;

      require(['vs/editor/editor.main'], () => {
        monaco.editor.create(document.getElementById('settings'), {
          value: sourceCode,
          language: 'json',
          lineNumbers: 'off',
          automaticLayout: true,
          minimap: { enabled: false },
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
        });
      });
    </script>
    </head>
    <body style="font-family: 'Mooli'">
      <div style="background-color: yellow; text-align: center;">
        <h1 style="color: green;">Oops, looks like something happened to your Palmares application ):</h1>
      </div>
      <div style="text-align: center;">
        <h1 style="color: red">Internal Server Error<h1>
      </div>
      <div style="text-align: center;">
        <h2>${error.name}</h2>
      </div>
      <h3>${error.message}</h3>
      <div style="width: 100%; background-color: #f1f1f1; border-radius: 20px">
        <div style="padding: 10px">
          <h4>Stack trace</h4>
          <button id="open-in-editor">Open in editor</button>
          <div style="border-bottom: 1px solid black; width: 100%; height: 1px;" ></div>
          <pre >${error.stack}</pre>
        </div>
      </div>
      <br>
      <div style="width: 100%; background-color: #f1f1f1; border-radius: 20px">
        <div style="padding: 10px">
          <h4>App Settings</h4>
          <div style="border-bottom: 1px solid black; width: 100%; height: 1px;" ></div>
          <div id="settings" style="width: 100%; height: 50vh"></div>
        </div>
      </div>
      <br>
      <div style="width: 100%; background-color: #f1f1f1; border-radius: 20px">
        <div style="padding: 10px">
          <h4>Domains</h4>
          <div style="border-bottom: 1px solid black; width: 100%; height: 1px;" ></div>
          ${domains
            .map(
              (domain, index) =>
                `<h3>${domain.name}</h3><h5>${domain.path}</h5>${index !== domains.length - 1 ? '<br>' : ''}`
            )
            .join('')}
        </div>
      </div>
      <script>
        document.getElementById('open-in-editor').addEventListener('click', () => {
          fetch('/error/open-in-editor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ errorFile: '${errorFile}', errorLine: ${errorLine}, errorColumn: ${errorColumn} }),
          });
        });
      </script>
    </body>
    `,
    { status: 500, statusText: DEFAULT_SERVER_ERROR_STATUS_TEXT_MESSAGE, headers: { ['Content-Type']: 'text/html' } }
  );
};
