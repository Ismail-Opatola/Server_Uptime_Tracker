/**
 *
 * Library for storing and rotating logs
 */

//  Dependencies
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Container for the logs module
const lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname, "/../.logs/");

// Append a string to a file. Create a file if it does not exist.
lib.append = (file, string, callback) => {
  // Open the file for appending
  // 'a' switch - for appending or creating if it does not exist
  fs.open(lib.baseDir + file + ".log", "a", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Append to the file and close it
      // "\n" - add new line to break previuos/next json-string log data
      fs.appendFile(fileDescriptor, string + "\n", err => {
        if (!err) {
          fs.close(fileDescriptor, err => {
            if (!err) {
              callback(false);
            } else {
              callback("Error closing file that was beig appended");
            }
          });
        } else {
          callback("Error appending to file");
        }
      });
    } else {
      callback("Could not open file for appending");
    }
  });
};

// List all the logs, and optionally include the compressed logs
lib.list = (includeCompressedLogs, callback) => {
  fs.readdir(lib.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach(fileName => {
        // Add the .log files
        if (fileName.indexOf(".log") > -1) {
          trimmedFileNames.push(fileName.replace(".log", ""));
        }

        // (Optionaly) Add on the .gz files
        if (fileName.indexOf(".gz.b64") > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace(".gz.b64", ""));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, callback) => {
  const sourceFile = logId + ".log";
  const destFile = newFileId + ".gz.b64";

  // Read the source file
  fs.readFile(lib.baseDir + sourceFile, "utf8", (err, inputString) => {
    if (!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // Send the new compressed data to the destination file
          // 'wx' flag - writing
          fs.open(lib.baseDir + destFile, "wx", (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // Write to the destination file
              // make the buffer a base64 encoded string so that it could be written to a file
              fs.writeFile(fileDescriptor, buffer.toString("base64"), err => {
                if (!err) {
                  // Close the destination file
                  fs.close(fileDescriptor, err => {
                    if (!err) {
                      callback(false);
                    } else {
                      callback(err);
                    }
                  });
                } else {
                  callback(err);
                }
              });
            } else {
              callback(err);
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = (fileId, callback) => {
  const fileName = fileId + ".gz.b64";
  fs.readFile(lib.baseDir + fileName, "utf8", (err, str) => {
    if (!err && str) {
      // Decompress the data
      const inputBuffer = Buffer.from(str, "base64");
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // Callback
          const str = outputBuffer.toString();
          callback(false, str);
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Truncate a log file
// 0 flag - truncate all the way i.e everything
// emptying everything (0) out of the file
lib.truncate = (logId, callback) => {
  fs.truncate(lib.baseDir + logId + ".log", 0, err => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

// Export the module
module.exports = lib;
