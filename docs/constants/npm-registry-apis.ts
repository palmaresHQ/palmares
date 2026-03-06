export const JSDELIVR_API_DATA_HOST = 'https://data.jsdelivr.com';
export const JSDELIVR_API_CDN_HOST = 'https://cdn.jsdelivr.net';

export const GET_PACKAGE_BY_NAME_AND_VERSION = (packageName: string, version: string) =>
  `${JSDELIVR_API_DATA_HOST}/v1/package/npm/${packageName}@${version.replace(/[\^\~]/g, '')}/flat`;
export const GET_FILE_CONTENTS_BY_NAME_VERSION_AND_PATH = (packageName: string, version: string, path: string) =>
  `${JSDELIVR_API_CDN_HOST}/npm/${packageName}@${version.replace(/[\^\~]/g, '')}${path.split('/').map(encodeURIComponent).join('/')}`;

export type JSDELIVR_DATA_RESPONSE = {
  name: string;
  hash: string;
  time: string;
  size: number;
};
