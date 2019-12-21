/**
 * Library for storing and editing data
 */

//  dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// container for module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// write data to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  // wx flag - open the file for writing, error out if the file does exist
  // filedescriptor - a way to uniquely identify a certain file
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //   convert data to string
        const stringData = JSON.stringify(data);
        // write to file and close it
        fs.writeFile(fileDescriptor, stringData, err => {
          if (!err) {
            fs.close(fileDescriptor, err => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing new file");
              }
            });
          } else {
            callback("Error writing to new file");
          }
        });
      } else {
        callback("Could not create new file, it may already exist");
      }
    }
  );
};

// read data from a file
lib.read = (dir, file, callback) => {
  fs.readFile(lib.baseDir + dir + "/" + file + ".json", "utf8", (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update data from a file
lib.update = (dir, file, data, callback) => {
  // open the file for writing
  // r+ flag - error out if the file dosen't exist
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        //   convert data to string
        const stringData = JSON.stringify(data);

        // before we update the file there might be something in the file, so we need to truncate the file
        fs.ftruncate(fileDescriptor, err => {
          if (!err) {
            // write to the file and close it
            fs.writeFile(fileDescriptor, stringData, err => {
              if (!err) {
                fs.close(fileDescriptor, err => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing new file");
                  }
                });
              } else {
                callback("Error writing to existing file");
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("Could not open the file for update, it may not exist yet");
      }
    }
  );
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", err => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

// Export the module
module.exports = lib;
