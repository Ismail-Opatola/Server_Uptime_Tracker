/**
 * create and export configuration variables
 */

//  container for all environments
const environments = {};

// staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "ACe56cda3553541b63e7f9f8cea8c71f33",
    authToken: "1e87d8caaef00f34037ea31c450e733b",
    fromPhone: "+13345185739"
  },
  templateGlobals: {
    appName: 'UptimeChecker',
    companyName: 'NotARealCompany, Inc',
    'yearCreated': '2020',
    'baseUrl': 'http://localhost:3000/'
  }
};

// testing environment
environments.testing = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: "testing",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "ACe56cda3553541b63e7f9f8cea8c71f33",
    authToken: "1e87d8caaef00f34037ea31c450e733b",
    fromPhone: "+13345185739"
  },
  templateGlobals: {
    appName: 'UptimeChecker',
    companyName: 'NotARealCompany, Inc',
    'yearCreated': '2020',
    'baseUrl': 'http://localhost:3000/'
  }
};

// production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsAlsoASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: ""
  },
  templateGlobals: {
    appName: 'UptimeChecker',
    companyName: 'NotARealCompany, Inc',
    'yearCreated': '2020',
    'baseUrl': 'http://localhost:5000/'
    // 'baseUrl': '<siteUrl>'
  }
};

// determine which env was passed as command-line argument
const currentEnv =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// check that the current env is one of the envs above, if not, default to stagging
const environmentToExport =
  typeof environments[currentEnv] == "object"
    ? environments[currentEnv]
    : environments.staging;

// export the module
module.exports = environmentToExport;

// NOD_ENV=staging node index.js
