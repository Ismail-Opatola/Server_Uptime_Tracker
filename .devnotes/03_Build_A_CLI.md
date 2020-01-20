# Build A GUI

## A Tool for Administrators of this Application

All interaction with this program (inputs and outputs) will be via the console instead of a GUI

We'll build this CLI using an event-driven design pattern unlike the Restful-API functional pattern.

Everytime a user puts in a input into the console for the application to read, that is going to emmit an event, and a function or multiple functions in the application could be bound to the calling of that event and can respond to accordingly writting to the console anything that they want to write or just performing some proceess that they need to perform in response to a given input.

We want the app to respond to anumber of requests (inputs) from the user:

- `exit` - kill the application
- `man` / `help` - --help
- `stats` - respond with everything that we know about the current operating system, performance, load etc.
- `list users` - write out line by line every user in the system back to the console
- `more user info --{userId}` - print out everthing about a specific user
- `list checks`, `list checks --up`, `list checks --down` - list all checks created by all of the users in the system. Also allow flags `--up`, `--down` to narrow the checks to either currently _up_ or _down_ checks
- `more check info --{checkId}` - ___@return___ all the details about a specific check
- `list logs` - list out all of the logs in the system
- `more log info --{logId}` - ___@return___ more info about a specific log that hasn't been compressed. If it has been compressed, we need to decompress the log and provide the information for the specific user
