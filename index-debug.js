/***
 *
 * Primary file for the API
 */

//  Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");
const exampleDebuggingProblem = require("./lib/exampleDebuggingProblem");

//  Declare the app
const app = {};

// Init function
app.init = function() {
  // start the server
  debugger
  server.init();
  debugger
  
  // start the workers
  debugger
  workers.init();
  debugger
  // Start the CLI, but make sure it starts last
  debugger
  setTimeout(() => {
    cli.init();
  }, 50);
  debugger
  let foo = 1
  console.log('just assigned one to foo');
  debugger
  foo++
  console.log('just increamented foo');
  debugger
  foo = foo*foo
  console.log('just squared foo');
  debugger
  foo = foo.toString()
  console.log('just converted foo to string'); 
  debugger
  // Call the init script that would throw
  exampleDebuggingProblem.init();
  console.log('just called the library'); 
  debugger
};

// Excecute the app
app.init();

module.exports = app;
