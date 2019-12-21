/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// define a request handlers
const handlers = {};

// -----------------
// tokens handler
// -----------------
handlers.tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    // method not allowed
    callback(405);
  }
};

// container for all tokens submethods
handlers._tokens = {};

// tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
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

  if (phone && password) {
    // lookup the user with that phone number
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        // hash the sent password and compare it to the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // if valid create a new token with a ramdom name, Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires
          };

          // store the token
          _data.create("tokens", tokenId, tokenObject, err => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match the specified user's stored password"
          });
        }
      } else {
        callback(400, { Error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required feild(s)" });
  }
};

// tokens - get
// Required data: id
// optional data: none
handlers._tokens.get = (data, callback) => {
  // check that the id sent is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? data.payload.extend
      : false;

  if (id && extend) {
    // lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // check to make sure the token is not already expired
        if (tokenData.expires > Date.now()) {
          // set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // store the new updates
          _data.update("tokens", id, tokenData, err => {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update the token's expiration"
              });
            }
          });
        } else {
          callback(400, {
            Error: "The token has already expired, and cannot be extended"
          });
        }
      } else {
        callback(400, { Error: "Specifies token does not exist" });
      }
    });
  } else {
    callback(400, {
      Error: "Missing requiredfeild(s) or feild(s) are invalid"
    });
  }
};

// tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  // check that the id is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // delete token
        _data.delete("tokens", id, err => {
          if (!err) {
            callback(200);
          } else {
            callback(500, {
              Error: "Could not delete the specified token"
            });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// ----------------
// users handler
// ----------------
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
// only let an auth user access their object, don't let them access anyoneelse's
handlers._users.get = (data, callback) => {
  // check that the phone number is provided
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    //   get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // verify that the given token from the headers is valid for the phone number
    handlers._tokens.verifyToken(token.id, phone, tokenIsValid => {
      if (tokenIsValid) {
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
        callback(403, {
          Error: "Missing required token in header or token is invalid"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// Only let an auth user update their own object, don't let them update anyoneelse's
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
      // get the token from the headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      // verify that the given token from the headers is valid for the phone number
      handlers._tokens.verifyToken(token, phone, tokenIsValid => {
        if (tokenIsValid) {
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
          callback(403, {
            Error: "Missing required token in header or token is invalid"
          });
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
// only let an authenticated user delete their object, don't let them delete anyone else's
// @TODO: cleanup (delete) any othe data files associated with this user
handlers._users.delete = (data, callback) => {
  // check that the phine number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    // verify that the given token from the headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
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
        callback(500, {
          Error: "Missing required token in header, or ten is invalid"
        });
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// verify if a given tokenId is currently valid for a given user
handlers._tokens.verifyToken = (tokenId, phone, callback) => {
  // lookup the token
  _data.read("tokens", tokenId, (err, tokenData) => {
    if (!err && tokenData) {
      // check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
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
