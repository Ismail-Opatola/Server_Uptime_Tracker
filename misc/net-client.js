/**
 * Example TCP (Net) Client
 * Connects to port 6000 and sends the word 'ping' to the server *
 *
 * */

//  Dependencies
const net = require("net");

// Define the message to send
const outboundMessage = "ping";

// Create the client
const client = net.createConnection({ port: 6000 }, () => {
  // when the connection to the serve has been opened, Send this message
  client.write(outboundMessage);
});

// whien the server writes back, log what it says then kill the client
client.on("data", inboundMessage => {
  const messageString = inboundMessage.toString();
  console.log(`I wrote ${outboundMessage} and they said ${messageString}`);
  client.end();
});

// run in cli
// $ node misc/net-server.js
// $ node misc/net-client.js
