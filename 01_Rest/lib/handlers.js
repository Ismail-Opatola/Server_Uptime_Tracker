/**
 * Request handlers
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");
const config = require("./config");

// define a request handlers
const handlers = {};

/**
 * HTML Hndlers
 *
 */

// Index handler
handlers.index = (data, callback) => {
  // callback(undefined, undefined, "html");

  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Prepare data for interpolation
    const templateData = {
      "head.title": "This is the title",
      "head.description": "This is the description",
      "body.title": "Hello templated world",
      "body.class": "index"
    };

    // Read in a template as a string
    helpers.getTemplate("index", templateData, (err, str) => {
      if (!err && str) {
        // Add universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            callback(200, str, "html");
          } else {
            callback(500, undefined, "html");
          }
        });
      } else {
        callback(500, undefined, "html");
      }
    });
  } else {
    callback(405, undefined, "html");
  }
};

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Read in the favicon data
    helpers.getStaticAsset("favicon.ico", (err, data) => {
      if (!err && data) {
        // Callback the data
        callback(200, data, "favicon");
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public Assets
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method == "get") {
    // Get the filename being requested
    var trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, function(err, data) {
        if (!err && data) {
          // Determine the content type (default to plain text)
          var contentType = "plain";

          if (trimmedAssetName.indexOf(".css") > -1) {
            contentType = "css";
          }

          if (trimmedAssetName.indexOf(".png") > -1) {
            contentType = "png";
          }

          if (trimmedAssetName.indexOf(".jpg") > -1) {
            contentType = "jpg";
          }

          if (trimmedAssetName.indexOf(".ico") > -1) {
            contentType = "favicon";
          }

          // Callback the data
          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

/**
 * JSON API Hndlers
 *
 */

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
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
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
// cleanup (delete) any other data files associated with this user
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
        _data.read("users", phone, (err, userData) => {
          if (!err && userData) {
            //   remove the hash password from the user object before returning it to the requester
            _data.delete("users", phone, err => {
              if (!err) {
                // delete each of the checks associated with the user
                const userChecks =
                  typeof userData.checks == "object" &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];
                const checksToDelete = userChecks.length;

                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;

                  // loop through the checks
                  userChecks.forEach(checkId => {
                    // delete the check
                    _data.delete("checks", checkId, err => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            Error:
                              "Errors encountered while attempting to delete all of the user's checks. all checks may not have been deleted from the system successfully"
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
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

// -----------------
// checks handler
// ----------------
handlers.checks = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    // method not allowed
    callback(405);
  }
};

// container for the checks submethods
handlers._checks = {};

// check - post
// Required data: protocol (http or https), url, method, successCode, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
  // check the required feild
  const protocol =
    typeof data.payload.protocol == "string" &&
    ["http", "https"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // get the token from the headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    // lookup the user by reading the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;

        // lookup user data
        _data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            const userChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];

            // verify that the user has less than the number of max-checks-per-user
            if (userChecks.length < config.maxChecks) {
              // create a random id for the checks
              const checkId = helpers.createRandomString(20);

              // create the check obj an ginclude the user's phone
              const checkObject = {
                id: checkId,
                userPhone: userPhone,
                protocol: protocol,
                url: url,
                method: method,
                successCodes: successCodes,
                timeoutSeconds: timeoutSeconds
              };

              // save the object to disk
              _data.create("checks", checkId, checkObject, err => {
                if (!err) {
                  // add the check id to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // save the new user data
                  _data.update("users", userPhone, userData, err => {
                    if (!err) {
                      // return the data about the new check
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        Error: "Could not update the user with the new check"
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not create the new check" });
                }
              });
            } else {
              callback(400, {
                Error: `The user already has the maximum number of checks ${config.maxChecks}`
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: "Missing required inputs, or inputs are invalid" });
  }
};

// checks - get
// Required data : checkId
// Optional data : none
handlers._checks.get = (data, callback) => {
  // check that id is valid
  const checkId =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (checkId) {
    // lookup the check
    _data.read("checks", checkId, (err, checkData) => {
      if (!err && checkData) {
        //   get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;
        // verify that the given token from the headers is valid and belongs to the user who created the check

        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          tokenIsValid => {
            if (tokenIsValid) {
              // return the check data
              callback(200, checkData);
            } else {
              callback(403, {
                Error: "Missing required token in header or token is invalid"
              });
            }
          }
        );
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required feild" });
  }
};

// check - put
// required data: id
// optional data : protocol, url, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = (data, callback) => {
  // check the required feild
  const checkId =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  // check the optional data
  const protocol =
    typeof data.payload.protocol == "string" &&
    ["http", "https"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  // Error if the id is invalid
  if (checkId) {
    // check to make sure one or more optional feild is sent
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // lookup the check
      _data.read("checks", checkId, (err, checkData) => {
        if (!err && checkData) {
          //   get the token from the headers
          const token =
            typeof data.headers.token == "string" ? data.headers.token : false;
          // verify that the given token from the headers is valid and belongs to the user who created the check

          handlers._tokens.verifyToken(
            token,
            checkData.userPhone,
            tokenIsValid => {
              if (tokenIsValid) {
                // update the check data where necessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }

                // store the updates
                _data.update("checks", checkId, checkData, err => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, { Error: "Could not update the check" });
                  }
                });
              } else {
                callback(403, {
                  Error: "Missing required token in header or token is invalid"
                });
              }
            }
          );
        } else {
          callback(400, { Error: "check id did not exist" });
        }
      });
    } else {
      callback(400, { Error: "Missing feild to update" });
    }
  } else {
    callback(400, { Error: "Missing required feild" });
  }
};

// checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, callback) => {
  // check that the ID is valid
  const checkId =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (checkId) {
    // lookup te check
    _data.read("checks", checkId, (err, checkData) => {
      if (!err && checkData) {
        // get the token from the headers
        const token =
          typeof data.headers.token == "string" ? data.headers.token : false;

        // verify that the given token from the headers is valid for the phone number
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          tokenIsValid => {
            if (tokenIsValid) {
              // delete the check data
              _data.delete("checks", checkId, err => {
                if (!err) {
                  // lookup the user
                  _data.read("users", checkData.userPhone, (err, userData) => {
                    if (!err && userData) {
                      const userChecks =
                        typeof userData.checks == "object" &&
                        userData.checks instanceof Array
                          ? userData.checks
                          : [];

                      // remove the delete check from their list of checks
                      const checkPosition = userChecks.indexOf(checkId);
                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);
                        // mutation technique
                        // we're mutating the data on the fly by splicing checkPosition which hold refs to checkData.checks array,
                        // not copying it like i would to avoid mutation.
                        // userData.checks = userChecks
                        // but by re-assigning/updating DB with the mutated data userData, the object refs changes at the storage level i.e _data.update
                        // if I had just copied it them i would have copied the data twice

                        // re-save the user's data
                        _data.update(
                          "users",
                          checkData.userPhone,
                          userData,
                          err => {
                            if (!err) {
                              callback(200);
                            } else {
                              callback(500, {
                                Error: "Could not update the user check list"
                              });
                            }
                          }
                        );
                      } else {
                        callback(500, {
                          Error:
                            "Could not find the check on the user's object, thus could not remove it"
                        });
                      }
                    } else {
                      callback(400, {
                        Error: "Could not find the user who created the check"
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not delete the check data" });
                }
              });
            } else {
              callback(500, {
                Error: "Missing required token in header, or ten is invalid"
              });
            }
          }
        );
      } else {
        callback(400, { Error: "The specified check ID does not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing Required feild" });
  }
};

// --------------
// ping handler
// ------------------
handlers.ping = (data, callback) => {
  // callback a http status code and a payload object
  callback(200);
};

// -------------------------
// -------------------------
// -------------------------
// -------------------------

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

// Not-found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
