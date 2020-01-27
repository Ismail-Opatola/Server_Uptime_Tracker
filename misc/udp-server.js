/**
 * Example UDP Server
 * Creating a UDP datagram server listening on 6000
 *
 */

//  Dependencies
const dgram = require("dgram");

// Creating a server
const server = dgram.createSocket("udp4");
// (udp4) - type of udp server it should create

server.on("message", (messageBuffer, sender) => {
  // Do something with an incoming message or do something with the sender
  const messageString = messageBuffer.toString();
  console.log(messageString);
});

// Bind to 6000
server.bind(6000, () => {
  console.log("\x1b[35m%s\x1b[0m", `The UDP server is listening on port 6000`);
});

// Run
// $ node misc/udp-server.js
// $ node misc/udp-client.js
