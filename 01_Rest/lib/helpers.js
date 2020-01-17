/**
 * Helpers fro various tasks
 */

// dependencies
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require("querystring");
const path = require("path");
const fs = require("fs");

//  container for all the helpers
const helpers = {};

// create a SHA256 hash
helpers.hash = str => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// parse a JSON string to an object in all cases, without throwing an error
helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a give length
helpers.createRandomString = strLength => {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;

  if (strLength) {
    // define all the poible characters that could go into a sring
    const possibleCharacters = "adcdefghijklmnopqrstuvwxyz0123456789";
    // start the final string
    let str = "";
    for (i = 1; i <= strLength; i++) {
      // get a random character from the possibleCharacters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // append this character to the first string
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

// Send an SMS message via Twilio
helpers.sendTwilioSms = (phone, message, callback) => {
  // validate parameters
  phone =
    typeof phone == "string" && phone.trim().length == 10
      ? phone.trim().length
      : false;
  message =
    typeof message == "string" &&
    message.trim().length > 0 &&
    message.trim().length <= 1600
      ? message.trim()
      : false;

  if (phone && message) {
    // Configure the request payload
    const payload = {
      from: config.twilio.fromPhone,
      to: `+234${phone}`,
      body: message
    };

    // stringify payload using querystring module instead of JSON.stringify because the reqeust we'll be sending is not of application/json but 'application/x-www-form-urlencoded' form content-type as specified by Twilio
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request
    const req = https.request(requestDetails, res => {
      // grab the status of the sent request
      const status = res.statusCode;
      console.log([
        `(sendTwilioSms) making https post request`,
        `(sendTwilioSms) response completed: ${res.complete}`,
        `(sendTwilioSms) response statusCode: ${res.statusCode}`,
        { "(sendTwilioSms) response headers:": res.headers },
        { "(sendTwilioSms) response body:": res.body }
      ]);
      // callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);
      } else {
        callback(500, {
          Error: `Status code returned was ${status}: ${res.statusMessage}`
        });
      }
    });

    // bind to the error event so it doesn't get thrown
    // we don't want any error to kill the thread
    // so if the req we created emits an event called 'error', we want to invoke this function which would simply callback the error to our requester
    req.on("error", e => {
      callback(e);
    });

    // add the payload to the request
    req.write(stringPayload);

    // end the request
    // once the app hits this point, its actually going to send the request and when it returns, the callback will get called either because an error happend or it return successfully
    req.end();
  } else {
    callback(400, { Error: "Given parameters were missing or invalid" });
  }
};

// Get the string content of a template
helpers.getTemplate = (templateName, callback) => {
  templateName =
    typeof templateName == "string" && templateName.length > 0
      ? templateName
      : false;
  if (templateName) {
    const templateDir = path.join(__dirname, "/../templates/");
    fs.readFile(`${templateDir}${templateName}.html`, "utf8", (err, str) => {
      if (!err && str && str.length > 0) {
        callback(false, str);
      } else {
        callback("No template could be found");
      }
    });
  } else {
    callback("A valid template name was not specified");
  }
};

module.exports = helpers;
