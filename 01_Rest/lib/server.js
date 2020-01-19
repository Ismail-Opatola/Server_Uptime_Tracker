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
    let chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;
    // If the request is within the public directory, use the public handler instead
    chosenHandler =
      trimmedPath.indexOf("public/") > -1 ? handlers.public : chosenHandler;

    // construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // route the request to the hadler specified in the router
    chosenHandler(data, (statusCode, payload, contentType) => {
      // Determine the type of response, fallback to JSON
      contentType = typeof contentType == "string" ? contentType : "json";
      // use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // return response-parts that are content-specific
      let payloadString = "";

      if (contentType == "json") {
        res.setHeader("Content-Type", "application/json");
        // use the payload called back by the handler, or default to an empty object
        payload = typeof payload == "object" ? payload : {};
        // convert the payload to a string
        payloadString = JSON.stringify(payload);
      }
      if (contentType == "html") {
        res.setHeader("Content-Type", "text/html");
        payloadString = typeof payload == "string" ? payload : "";
      }
      if (contentType == "favicon") {
        res.setHeader("Content-Type", "image/x-icon");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }
      if (contentType == "plain") {
        res.setHeader("Content-Type", "text/plain");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }
      if (contentType == "css") {
        res.setHeader("Content-Type", "text/css");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }
      if (contentType == "png") {
        res.setHeader("Content-Type", "image/png");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }
      if (contentType == "jpg") {
        res.setHeader("Content-Type", "image/jpeg");
        payloadString = typeof payload !== "undefined" ? payload : "";
      }

      // return response-parts that are common to all content-type
      res.writeHead(statusCode);
      res.end(payloadString);

      // log reponse: If the response is 200 print green, otherwise print red
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
  "": handlers.index,
  "account/create": handlers.accountCreate, // signup
  "account/edit": handlers.accountEdit,
  "account/deleted": handlers.accountDeleted,
  "session/create": handlers.sessionCreate, // login
  "session/deleted": handlers.sessionDeleted, // logout
  "checks/all": handlers.checksList, // dashboard
  "checks/create": handlers.checksCreate,
  "checks/edit": handlers.checksEdit,
  ping: handlers.ping,
  "api/users": handlers.users,
  "api/tokens": handlers.tokens,
  "api/checks": handlers.checks,
  "favicon.ico": handlers.favicon,
  public: handlers.public
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
