Node apps are vunerable to crashes due to a number of reasons. one is that its a single threaded application, and if anything your write or any library you're using throws an error, that would take down the thread and once the thrad is down its down for the entire application.

Because of this, its extreamely important to bullet-proof your code. There's a number of ways to do that like peer review etc. but one of the best ways you can do it on your own is to add test coverage, node debugger, do some lightweigth linting, commenting your code so that others can read and understand your code.

This section we'll discuss how to gain stability with node applications

- how to properly create, use, and catch errors
- advanced use of the debugger
- using 'strict' to lint your code
- adding a test runner, unit tests, and integration tests using node's built-in assertion libs that comes out-of-the-box and how making different assertions can help you debug any issues as they arise
- unit test
- api integration test
