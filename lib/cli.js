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

// Input handlers
e.on("man", str => {
  cli.responders.help();
});
e.on("help", str => {
  cli.responders.help();
});
e.on("exit", str => {
  cli.responders.exit();
});
e.on("stats", str => {
  cli.responders.stats();
});
e.on("list users", str => {
  cli.responders.listUsers();
});
e.on("more user info", str => {
  cli.responders.moreUserInfo(str);
});
e.on("list checks", str => {
  cli.responders.listChecks(str);
});
e.on("more check info", str => {
  cli.responders.moreCheckInfo(str);
});
e.on("list logs", str => {
  cli.responders.listLogs();
});
e.on("more log info", str => {
  cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = () => {
  const commands = {
    exit: "Kill the CLI [and the rest of the application]",
    man: "Show this help page",
    help: 'Alias of the "man" command',
    stats:
      "Get statistics on the underlying operating system and resource utilization",
    "list users":
      "Show a list of the registered (undeleted) users in the system",
    "more user info --{userId} ": "Show details of a specific user",
    "list checks --up --down": `Show alist of al the active checks in the system, including their state. The "--up" and the "--down" flags are both optional`,
    "more check info --{checkId}": "Show details of a specified check",
    "list logs": `Show a list of all the files available to be read 
    (compressed and uncompressed)`,
    "more log info --{fileName}": "Show details of a specified log file"
  };

  //  Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by it explanation in white and yellow respectively
  for (const key in commands) {
    if (commands.hasOwnProperty(key)) {
      let value = commands[key];
      let line = `\x1b[33m${key}\x1b[0m`;
      const padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);

  // End with another horizontalLine
  cli.horizontalLine();
};

// Create a vertical space
cli.verticalSpace = lines => {
  lines = typeof lines == "number" && lines > 0 ? lines : 1;
  for (let i = 0; i < lines; i++) {
    console.log("");
  }
};
// Create a horizontal line across the screen
cli.horizontalLine = () => {
  // Get the available acreen size
  const width = process.stdout.columns;
  let line = "";
  for (let i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};
// Create centered text on the screen
cli.centered = str => {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";

  // Get the available acreen size
  const width = process.stdout.columns;
  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  let line = "";
  for (let i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

// Exit
cli.responders.exit = () => {
  process.exit(0);
};

// Stats
cli.responders.stats = () => {
  console.log("You asked for stats");
};

// List Users
cli.responders.listUsers = () => {
  console.log("You asked to list users");
};

// More User Info
cli.responders.moreUserInfo = str => {
  console.log("You asked for more user info", str);
};

// List Checks
cli.responders.listChecks = str => {
  console.log("You asked to list checks", str);
};

// More Checks Info
cli.responders.moreCheckInfo = str => {
  console.log("You asked for more check info", str);
};

// List Logs
cli.responders.listLogs = () => {
  console.log("You asked for list logs");
};

// More Log Info
cli.responders.moreLogInfo = str => {
  console.log("You asked for more log info", str);
};

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
      console.log(`UptimeMonitor: command not found`);
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
    // (0) statusCode - means ok like server res (200)
    process.exit(0);
  });
};

// Export the module
module.exports = cli;
