In this section we are building a Restful API for an uptime monitoring application.

Whiele we won'tbe using any NPM packages, we'll be using a number of built-in Node modules.

An "uptime monitor" allows uses to enter URLs they want monitored, and receive alerts when those resources "go down" or "come back up".

The app should be usable, so we'll include features such as user sign-up and sign-in.

We'll also include functionality for sending an SMS alert to a user, rather than email.

Requirement Spec:

- The API listens on a PORT and accepts incoming HTTP requests for `POST, GET, PUT, DELETE and HEAD`
- The API allows a cliet to connect, then create a new user, then edit and delete that user.
- The API Allows a user to "sign in" ahich gives them a token that they can use for subsequent authenticated requests.
- The API allows the user to "sign out" which invalidates their token.
- The API allows a signed-in user to use their token to create a new "check".
- The API allows a signed-in user to edit or delete any of their checks.
- In the background, workers perform all the "checks" at the appropriate times, and send alerts to the users when a check changes its state from `up` to `down`, or visa versa.

For our app, we'll use the filesystem as a key-value store of `JSON` docs. In a real app, you'd want a `DB`.
