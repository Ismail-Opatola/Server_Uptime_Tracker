/**
 * Async Hooks Example
 * 
 * You need to read through the documentation
 *
 */

//  Dependencies
const async_hooks = require("async_hooks");
const fs = require("fs");

//  Don't use asynchronous callbacks to track asynchronous functions, you want to log the function at the time executed by blocking the thread. console.log is async, use fs.writeFileSync its sync

// Target execution context
let targetExecutionContext = false;

// Write an arbitrary async function
const whatTimeIsIt = callback => {
  setInterval(() => {
    fs.writeSync(
      1,
      "When the setInterval runs, the execution context is " +
        async_hooks.executionAsyncId() +
        "\n"
    );
    callback(Date.now());
  }, 1000);
};

// Call that function
whatTimeIsIt(time => {
  fs.writeSync(1, "The time is " + time + "\n");
});

// Hooks
const hooks = {
  init(asyncId, type, triggerAsyncId, resource) {
    fs.writeSync(1, "Hook init " + asyncId + "\n");
  },
  before(asyncId) {
    fs.writeSync(1, "Hook before " + asyncId + "\n");
  },
  after(asyncId) {
    fs.writeSync(1, "Hook after " + asyncId + "\n");
  },
  promiseResolve(asyncId) {
    fs.writeSync(1, "Hook promiseResolve " + asyncId + "\n");
  },
  destroy(asyncId) {
    fs.writeSync(1, "Hook destroy " + asyncId + "\n");
  }
};

// Create a new AsyncHooks instance
const asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();
