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

// Init function
app.init = function(callback) {
  // start the server
  server.init();

  // start the workers
  workers.init();

  // Start the CLI, but make sure it starts last
  setTimeout(() => {
    cli.init();
    callback();
    // CID:0202 -- it will be called last since its the last to run
  }, 50);
  // CID:0202 -- added callback parameter to app.init for api testing purpose (calls back done()). see test/api > api[`app.init should start without throwing`])
};

/**
 * Self invoking only if required directly
 * ie : if app.init() was called from another file (in our case - test/api.js) don't invoke this one.
 * If you're invoking me directly, my module is going to be equal require.main. If this file was being invoked from another file and that other file is the one that's being called from the command-line require.main !== module so this initialization function ould never happen
 * here when you run `node index.js` module = app, in test/api when you run `node test/api` module = api
 * see test/api > api[`app.init should start without throwing`])
 **/
if (require.main == module) {
  app.init(() => {});
}

module.exports = app;
