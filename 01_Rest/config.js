/**
 * create and export configuration variables
 */

//  container for all environments
const environments = {};

// staging (default) environment
environments.staging = {
  port: 3000,
  envName: "staging"
};
// production environment
environments.production = {
  port: 5000,
  envName: "production"
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
