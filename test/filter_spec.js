'use strict';

const helpers = require('./spec_helpers');

function replaceWords(icap, pattern, value) {
  icap.uri = icap.uri.replace(pattern, value);
  for (const key in icap.headers) {
    if (!icap.headers.hasOwnProperty(key) || !icap.headers[key]) {
      continue;
    }
    icap.headers[key] = icap.headers[key].replace(pattern, value);
  }
}

helpers.testIO('should replace "posting" with "-------"', 'filter', (t, server, cb) => {
  // handle whitelisted domains normally
  server.request('*', (icapReq, icapRes, req, res, next) => {
    replaceWords(req, /posting/g, (match) => {
      let str = '', ix = match.length;
      while (ix--) {
        str += '-';
      }
      return str;
    });

    icapRes.setIcapStatusCode(200);
    icapRes.setIcapHeaders(icapReq.headers);
    icapRes.setHttpMethod(req);
    icapRes.setHttpHeaders(req.headers);
    icapRes.writeHeaders(icapReq.hasBody());
    icapRes.setFilter((data) => {
      const str = data.toString();
      if (/posting/.test(str)) {
        return str.replace(/posting/g, '-------');
      }
      return data;
    });
    icapReq.pipe(icapRes);
  });

  setTimeout(cb, 1500);
});
