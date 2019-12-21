/***
 *
 * Primary file for the API
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");

// instantial the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// start the HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(
    `The server is listening on port ${config.httpPort} in ${config.envName} mode`
  );
});

// instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem")
};
// we're passing the httpsServerOptions to the https server when it starts so it can actually create a secure connection when it starts
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(
    `The server is listening on port ${config.httpsPort} in ${config.envName} mode`
  );
});

// all the server logic for both http and https server
const unifiedServer = (req, res) => {
  // get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path from the url object
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // get the qery string as an object
  const queryStringObject = parsedUrl.query;

  // get the HTTP Method
  const method = req.method.toLowerCase();

  // get the headers as an object
  const headers = req.headers;

  // get the payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", data => {
    // on data event stream, append data to buffer
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    // choose the handler this request should goto, if one is not found, use the notFound handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer
    };

    // rout the request to the hadler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      // use the payload called back by the handler, or default to an empty object
      payload = typeof payload == "object" ? payload : {};

      // convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // return response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      //   log reponse
      console.log("Returning this response: ", statusCode, payloadString);
    });

    // send the response
    // res.end("hello\n");

    // console.log("Reqest received with this payload: ", buffer);
  });
};

// define a request handlers
const handlers = {};

// smaple handler
handlers.sample = (data, callback) => {
  // callback a http status code and a payload object
  callback(406, { name: "sample handler" });
};

// Not-found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// define a request router
const router = {
  sample: handlers.sample
};

// ====================================

// log the request
//   console.log(
//     "Reqest received on path: " +
//       trimmedPath +
//       " with this method: " +
//       method +
//       " and with these query string params:",
//     queryStringObject
//   );
// console.log("Reqest received with these headers: ", headers);
// cli
// curl localhost:3000/foo
// > hello
// > foo
// cli - trimmedPath, method
// curl localhost:3000/foo/bar
// > hello
// Reqest received on path: hy/gg with this method: get
// cli
// $ curl localhost:3000/hy/gg?q=foo
// > Reqest received on path: hy/gg with this method: get and with these query string params: [Object: null prototype] { q: 'foo' }
