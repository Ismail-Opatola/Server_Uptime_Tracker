/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// define a request handlers
const handlers = {};

// users handler
handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    // method not allowed
    callback(405);
  }
};

// container for the users submethods
handlers._users = {};

// users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
  // check that all required feilds a filled out
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    //  Make sure that the user doesn't already exist
    _data.read("users", phone, err => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create the user object
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: tosAgreement
          };

          // store the user object
          _data.create("users", phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password" });
        }
      } else {
        // user already exists
        callback(400, {
          Error: "A user with that phone number already exists"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required feilds" });
  }
};

// users - get
// Required data: phone
// Optional data: none
// @TODO: only let an auth user access their object, don't let them access anyoneelse's
handlers._users.get = (data, callback) => {
  // check that the phone number is provided
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        //   remove the hash password from the user object before returning it to the requester
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO: Only let an auth user update their own object, don't let them update anyoneelse's
handlers._users.put = (data, callback) => {
  // check the required feild
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  // check for the optional feilds
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Error if the phone is invalid
  if (phone) {
    //  Error if notthing is sent to update
    if (firstName || lastName || password) {
      // lookup the user
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          // update the feilds necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.password = helpers.hash(password);
          }

          // store the new update
          _data.update("users", phone, userData, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not update the user" });
            }
          });
        } else {
          callback(400, { Error: "The spacified user does not exist" });
        }
      });
    } else {
      callback(400, { Error: "Missing feilds to update" });
    }
  } else {
    callback(400, { Error: "Missing required feild" });
  }
};

// users - delete
// Required feild: phone
// @TODO: only let an authenticated user delete their object, don't let them delete anyone else's
// @TODO: cleanup (delete) any othe data files associated with this user
handlers._users.delete = (data, callback) => {
  // check that the phine number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    _data.read("users", phone, (err, data) => {
      if (!err && data) {
        //   remove the hash password from the user object before returning it to the requester
        _data.delete("users", phone, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified user" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// ping handler
handlers.ping = (data, callback) => {
  // callback a http status code and a payload object
  callback(200);
};

// Not-found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
