/**
 * Example VM
 * running some arbitrary commands
 *
 */

//
// Dependencies
const vm = require("vm");

// Define a context for the script to run in
const context = {
  foo: 25
};

// Define the script

const script = new vm.Script(`
let fizz = 52;
foo = foo * 2;
let bar = foo * 1;
`);

// Run the script
script.runInNewContext(context);
console.log(context);

/**
 * Run in cli
 * $ node misc/vm.js
 * Output
 * { foo: 50 }
 */

//  useful for running a code in isolation