import { serverResponseAdapter } from '@palmares/server';

export default serverResponseAdapter({
  // eslint-disable-next-line ts/require-await
  redirect: async (_serveradapter, _server, serverRequestAndResponseData, _status, _headers, redirectTo) => {
    return serverRequestAndResponseData.response.redirect(redirectTo);
  },
  // eslint-disable-next-line ts/require-await
  send: async (_serveradapter, _server, serverRequestAndResponseData, status, headers, body) => {
    return new serverRequestAndResponseData.response(body, {
      headers,
      status: status
    });
  },
  stream(_serveradapter, _server, serverRequestAndResponseData, _status, _headers, _body, _isAsync) {
    return serverRequestAndResponseData.response.stream(_body, _isAsync);
  },
  sendFile(_serveradapter, _server, serverRequestAndResponseData, _status, _headers, _filePath) {
    return serverRequestAndResponseData.response.sendFile(_filePath);
  }
});
