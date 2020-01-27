/**
 * Example - UDP client
 * Sending a message to a UDP server on port 6000
 *
 */

//  Dependencies
const dgram = require("dgram");

// create the client

const client = dgram.createSocket("udp4");

//  Define the message and pull kit into a Buffer
const messageString = `This is a message`;
const messageBuffer = Buffer.from(messageString);

// Send off the mesage
client.send(messageBuffer, 6000, `localhost`, err => {
  client.close();
});

// Run
// $ node misc/udp-server.js
// $ node misc/udp-client.js
