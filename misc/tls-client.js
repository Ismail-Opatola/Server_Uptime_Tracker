/**
 * Example TLS Client
 * Connects to port 6000 and sends the word 'ping' to the server *
 *
 * */

//  Dependencies
const tls = require("tls");
const fs = require("fs");
const path = require("path");

// Server options
const options = {
  ca: fs.readFileSync(path.join(__dirname, "../https/cert.pem")) 
};
  // since in this example we created these certificates locally, they're considered a self-signed certificates. When you have a self-signed certificate it doesn't have the authority of a normal SSL certificate that you would get. so because of that, we need to include the certicicate with our connections when we're creating our client (This is only the case fro self-signed certificates, if you're using a real SSL you're not going to need to do this)

// Define the message to send
const outboundMessage = "ping";

// Create the client
const client = tls.connect(6000, options, () => {
  //Send this message
  client.write(outboundMessage);
});

// whien the server writes back, log what it says then kill the client
client.on("data", inboundMessage => {
  const messageString = inboundMessage.toString();
  console.log(`I wrote ${outboundMessage} and they said ${messageString}`);
  client.end();
});

// run in cli
// $ node misc/tls-server.js
// $ node misc/tls-client.js

// compare
// low-level         high level
// net        ==     http
// tls        ==     https
