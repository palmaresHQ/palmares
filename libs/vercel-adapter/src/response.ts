import { serverResponseAdapter } from "@palmares/server"

export default serverResponseAdapter({
  redirect: async (_server, serverRequestAndResponseData, _status, _headers, redirectTo) => {
    return serverRequestAndResponseData.response.redirect(redirectTo);
  },
  send: async (_server, serverRequestAndResponseData, status, headers, body) => {
    return new serverRequestAndResponseData.response(body, {
      headers,
      status: status
    })
  },
  stream(_server, serverRequestAndResponseData, _status, _headers, _body, _isAsync) {
    return serverRequestAndResponseData.response.stream(_body, _isAsync);
  },
  sendFile(_server, serverRequestAndResponseData, _status, _headers, _filePath) {
    return serverRequestAndResponseData.response.sendFile(_filePath);
  },
})
