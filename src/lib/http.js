/*eslint no-ternary: "off"*/
/*eslint global-require: "off"*/
"use strict";

const urlParse = require('url');
const log = require('./log.js').init('http.js');
const config = require('../config/config.js');

const _request = (method, url, data) => new Promise((resolve, reject) => {
  const options = typeof url === "object" ? url : urlParse.parse(url);
  const lib = options.protocol.startsWith('https') ? require('https') : require('http');
  options.auth = config.username && config.password ? `${config.username}:${config.password}` : undefined;
  options.method = method;
  options.headers = options.headers || {};
  options.headers["User-Agent"] = 'NodeRequest';
  options.headers["Content-Type"] = 'application/json';
  log.debug(`Request Method: ${options.method} ${url}`);
  log.verbose(options);
  log.verbose(data);
  const request = lib.request(options, response => {
    const body = [];
    const getResponseFormat = response => ({
      status: response.statusCode,
      headers: response.headers,
      body: body.join('')
    });
    response.on('data', chunk => body.push(chunk));
    response.on('end', () =>
      response.statusCode > 399
      ? reject(getResponseFormat(response))
      : resolve(getResponseFormat(response)));
  });
  // handle connection errors of the request
  request.on('error', err => reject(err));
  request.end(typeof data === "object" ? JSON.stringify(data) : data || "");
});

module.exports = {
  get: url => _request("GET", url),
  head: url => _request("HEAD", url),
  delete: url => _request("DELETE", url),
  post: (url, data) => _request("POST", url, data),
  put: (url, data) => _request("PUT", url, data)
};
