/**
 * Example TLS Server
 * Listens to port 60000 and sends the word 'pong' to the client
 */

//  Dependencies
const tls = require("tls");
const fs = require('fs')
const path = require('path')

// Server options
const options = {
  key: fs.readFileSync(path.join(__dirname, "../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "../https/cert.pem"))
};
// Create the server
const server = tls.createServer(options, connection => {
  // Send the word 'pong'
  const outboundMessage = "pong";
  connection.write(outboundMessage);

  // when the client writes something log it out
  connection.on("data", inboundMessage => {
    const messageString = inboundMessage.toString();
    console.log(`I wrote ${outboundMessage} and they said ${messageString}`);
  });
});

// listen
server.listen(6000, () => {
  console.log("\x1b[35m%s\x1b[0m", `The TLS server is listening on port 6000`);
});

// run in cli
// $ node misc/tls-server.js
// $ node misc/tls-client.js


// compare
// low-level         high level
// net        ==     http
// tls        ==     https