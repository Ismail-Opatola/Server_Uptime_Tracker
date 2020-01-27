/**
 * Example HTTP-2 Client
 */

const http2 = require("http2");

//  Create client
const client = http2.connect("http://localhost:6000");

// Create a request
const req = client.request({
  ":path": "/"
});

// When a message is received, add the pieces of it together until you reach the end

// (if you remember parsing http payloads from incomming request when we were building api, data thats comming in is going to stream in and http2 is no different, in fect http2 is enforcing these behaviour. previously when we were creating http servers we were thinking of ther client as something that sent the payload and the server as something gthat received hthe payload. Now we are configuring the client, we're telling the client to stream in data coming from the  server, that is because http-2 lick web-sockets opens up a duplex connection where both client and server can send data back and fort to each other in this open streams )

// so we need to allow hthe client to readin the payload from the server just as we would have the server do from the client
let stream = "";
req.on("data", chunk => {
  stream += chunk;
});

// when the message ends, log it out
req.on("end", () => {
  console.log(stream);
});

// End the request
req.end();

// To start the server Run in CLI
// $ node misc/http2-server.js
// To start the client Run in CLI
// $ node misc/http2-client.js