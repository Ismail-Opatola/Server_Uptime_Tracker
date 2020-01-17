/**
 * server related task
 *
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const handlers = require("./handlers");
const helpers = require("./helpers");
const path = require("path");
const util = require("util");
const debug = util.debuglog("server"); // NODE_DEBUG=server node index.js

// instantiate server module object
const server = {};

// instantial the HTTP server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// instantiate the HTTPS server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem"))
};
// we're passing the httpsServerOptions to the https server when it starts so it can actually create a secure connection when it starts
server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// all the server logic for both http and https server
server.unifiedServer = (req, res) => {
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
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;

    // construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // route the request to the hadler specified in the router
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

      //   log reponse: If the response is 200 print green, otherwise print red
      if (statusCode == 200) {
        debug(
          "\x1b[32m%s\x1b[0m",
          `${method.toLowerCase()} /${trimmedPath} ${statusCode}`
        );
      } else {
        debug(
          "\x1b[31m%s\x1b[0m",
          `${method.toLowerCase()} /${trimmedPath} ${statusCode}`
        );
      }
    });

    // send the response
    // res.end("hello\n");

    // debug("Reqest received with this payload: ", buffer);
  });
};

// define a request router
server.router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  checks: handlers.checks
};

// Init script
server.init = function() {
  // start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `The server is listening on port ${config.httpPort} in ${config.envName} mode`
    );
  });

  // start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `The server is listening on port ${config.httpsPort} in ${config.envName} mode`
    );
  });
};
module.exports = server;
