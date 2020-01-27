/**
 * Example TCP (Net) Server
 * Listens to port 60000 and sends the word 'pong' to the client
 */

//  Dependencies
const net = require("net");

// Create the server
const server = net.createServer(connection => {
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
  console.log("\x1b[35m%s\x1b[0m", `The Net server is listening on port 6000`);
});

// run in cli
// $ node misc/net-server.js
// $ node misc/net-client.js
