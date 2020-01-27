/**
 * Example HTTP-2 Server
 *
 */

//  Dependences
const http2 = require("http2");

// Init the server
const server = http2.createServer();

// On a stream, send back hello world html
// when someone connects on a stream we want to send this payload in response
server.on("stream", (stream, headers) => {
  stream.respond({
    status: 200,
    "content-type": "text/html"
  });
  stream.end("<html><body><p>Hello World</p></body></html>");
});

// Listen on 6000
server.listen(6000, () => {
  console.log(
    "\x1b[35m%s\x1b[0m",
    `The HTTP2 server is listening on port 6000`
  );
});

// To start the server Run in CLI
// $ node misc/http2-server.js
// To start the client Run in CLI
// $ node misc/http2-client.js