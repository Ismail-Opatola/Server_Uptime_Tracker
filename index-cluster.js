/***
 *
 * Primary file for the API
 */

//  Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");
const OS = require("os");
const cluster = require("cluster");

//  Declare the app
const app = {};

// Init function
app.init = function(callback) {

  // If we're on the master thread, start the background workers and the CLI
  if (cluster.isMaster) {

    // start the workers
    workers.init();

    // Start the CLI, but make sure it starts last
    setTimeout(() => {
      cli.init();
      callback();
    }, 50);

    // Fork the process
    for (let i = 0; i < OS.cpus().length; i++) {
      cluster.fork()
    }

  } else {

    // If we're not on the master, thread start the HTTP server
    server.init();
  }
};

if (require.main == module) {
  app.init(() => {});
}

module.exports = app;
