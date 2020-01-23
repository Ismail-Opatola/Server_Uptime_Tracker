/***
 *
 * Primary file for the API
 */

//  Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");

//  Declare the app
const app = {};

// Declare a global (that strict mode should catch)
fizz = "buzz" // node --use_strict index-strict.js (not working ask-stack)

// Init function
app.init = function() {
  // start the server
  server.init();

  // start the workers
  workers.init();

  // Start the CLI, but make sure it starts last
  setTimeout(() => {
    cli.init();
  }, 50);
};

// Excecute the app
app.init();

module.exports = app;
