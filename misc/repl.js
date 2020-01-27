/**
 * Example REPL server
 * Take in the word 'fizz' and lod out 'buzz'
 * Read-Evaluate-Print-Loop
 */

// Dependencies
const repl = require("repl");

// start the repl
repl.start({
  prompt: "> ",
  eval: str => {
    // evluation function
    console.log("At the evaluation stage: ", str);

    // If the user said 'fizz' say 'buzz' back to them
    if (str.indexOf("fizz") > -1) {
      console.log("buzz");
    }
  }
});

/* start up the repl in cli

$ node misc/repl.js
> foo
At the evaluation stage:  foo

fizz
At the evaluation stage:  fizz

buzz
*/