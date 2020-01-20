/**
 *
 * CLI-Related task
 *
 */

//  Dependencies
const readline = require("readline");
const util = require("util");
const debug = util.debuglog("cli"); // NODE_DEBUG=cli node index.js
const events = require("events");
class _events extends events {}
const e = new _events();

// Instantiate the CLI module object
const cli = {};

// Input pprocessor
cli.processInput = str => {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if th user actually wrote something otherwise ignore
  if (str) {
    // Codify the unique strings that identify the unique questions allowed to be asked
    const uniqueInputs = [
      "man",
      "help",
      "exit",
      "stats",
      "list users",
      "more user info",
      "list checks",
      "more check info",
      "list logs",
      "more log info"
    ];

    // Go through the possible inputs, and emmit an event when a match is found
    let matchFound = false,
      counter = 0;

    uniqueInputs.some(input => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // Emit an event matching the unique input, and include the full string given by the user
        e.emit(input, str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Sorry try again");
    }
  }
};

// Init script
cli.init = () => {
  // Send the start message to the console, in dark blue
  console.log("\x1b[34m%s\x1b[0m", `The CLI is running`);

  // Start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `> `
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input seperatly
  _interface.on("line", str => {
    // Send to the input processor
    cli.processInput(str);
    // Re-initialize the prompt
    _interface.prompt;
  });

  // If the user stops the CLI, kill the associated process
  _interface.on("close", () => {
    // 0 statusCode - means ok like server res 200
    process.exit(0);
  });
};

// Export the module
module.exports = cli;
