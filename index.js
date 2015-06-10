var request = require("request");
var url = require("url");
var path = require("path");

var baseConfig = {
  url: "https://api.routific.com",
  version: 1
}

// Gets a configuration value from either the `configuration` or the default
function getConfig(configuration, key){
  if(configuration && configuration.hasOwnProperty(key))
    return configuration[key]
  return baseConfig[key]
};

// Returns the full url for a given endpoint.
function endpoint(client, endpointPath) {
  return url.resolve(client.url, path.join("/v"+client.version, endpointPath));
}

// Constructor for the routific client object
function Routific(configuration) {
  this.url = getConfig(configuration, 'url');
  this.version = getConfig(configuration, 'version');
};

// Performs a call to the login endpoint.
// The callback will be called with `error` and `body`, being `body` the
//   parsed body of the response.
Routific.prototype.login = function(email, password, cb) {
  request({
    url: endpoint(this, "/users/login"),
    method: "POST",
    json: {
      email: email,
      password: password
    }
  }, function(err, response, body) {
    if(err)
      return cb(err)
    cb(undefined, body)
  })
};

module.exports = Routific
