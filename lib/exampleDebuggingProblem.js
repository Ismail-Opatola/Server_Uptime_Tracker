/**
 * This is a lib that demostrate somthing throwing when int is called
 */

//  Container for the mudule
const example = {}

// init function
example.init  = () => {
    // This is an err created intentionally (bar is not defined)
    const foo = bar
}


// Export the module
module.exports = example