/* eslint-disable max-len */
import { getErrorId } from '../handlers';
import { Response } from '../response';
import { HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR } from '../response/status';

import type { AllServerSettingsType } from '../types';
import type { Domain } from '@palmares/core';

export const DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY = 'Content-Type';
// Used for sending the file names, see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
export const DEFAULT_RESPONSE_HEADERS_CONTENT_DISPOSITION_KEY = 'Content-Disposition';
export const DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_JSON = 'application/json';
export const DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML = 'text/html';
export const DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_TEXT = 'plain/text';
export const DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_STREAM = 'application/octet-stream';
export const DEFAULT_RESPONSE_HEADERS_LOCATION_HEADER_KEY = 'Location';
export const DEFAULT_NOT_FOUND_STATUS_TEXT_MESSAGE = 'Not Found';
export const DEFAULT_SERVER_ERROR_STATUS_TEXT_MESSAGE = 'Internal Server Error';
export const DEFAULT_SERVER_ERROR_RESPONSE = (error: Error, settings: AllServerSettingsType, domains: Domain[]) => {
  const errorFileAndLines = error.stack?.split('\n');
  let errorFile = '';
  let errorLine = '';
  let errorColumn = '';
  while (errorFileAndLines?.length && errorFileAndLines.length > 0) {
    const errorFileAndLine = errorFileAndLines.shift()?.match(/\((.*)\)/)?.[1];
    if (errorFileAndLine) {
      errorFile = errorFileAndLine.split(':')[0];
      errorLine = errorFileAndLine.split(':')[1];
      errorColumn = errorFileAndLine.split(':')[2];
      if (errorFile && errorLine && errorColumn && errorFile !== '' && errorLine !== '' && errorColumn !== '') break;
    }
  }

  return new Response(
    `
    <head>
      <meta charset="utf-8">
      <title>[Palmares] - Internal Server Error</title>
      <link href="https://fonts.googleapis.com/css?family=Mooli" rel="stylesheet">
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
          <div style="display: inline-block;">
            <h4 style="display: inline-block;">Stack trace</h4>
            <button id="open-in-editor" style="display: inline-block; background-color: transparent; padding: 5px; border: 0; cursor: pointer">
              <p style="border-bottom: 1px solid black; color: green;">Open in editor</p>
            </button>
          </div>
          <div style="border-bottom: 1px solid black; width: 100%; height: 1px;" ></div>
          <pre>${error.stack}</pre>
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
        document.getElementById('open-in-editor').addEventListener('click', (e) => {
          e.preventDefault();
          fetch('/${getErrorId()}', {
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
    {
      status: HTTP_500_INTERNAL_SERVER_ERROR,
      statusText: DEFAULT_SERVER_ERROR_STATUS_TEXT_MESSAGE,
      headers: { [DEFAULT_RESPONSE_HEADERS_CONTENT_HEADER_KEY]: DEFAULT_RESPONSE_CONTENT_HEADER_VALUE_HTML }
    }
  );
};
export const DEFAULT_SERVER_ERROR_INVALID_QUERY_OR_PARAMS = () => {
  return Response.html(
    `
    <head>
    <meta charset="utf-8">
    <title>[Palmares] - Bad Request Error</title>
    <link href="https://fonts.googleapis.com/css?family=Mooli" rel="stylesheet">
    </head>
    <body>

    </body>
`,
    { status: HTTP_400_BAD_REQUEST, statusText: 'Query params or Url Params invalid' }
  );
};
