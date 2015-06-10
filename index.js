var request = require("request");
var url = require("url");
var path = require("path");

var baseConfig = {
  url: "https://api.routific.com",
  version: 1
}

function getConfig(configuration, key){
  if(configuration && configuration.hasOwnProperty(key))
    return configuration[key]
  return baseConfig[key]
};

function endpoint(client, endpointPath) {
  return url.resolve(client.url, path.join("/v"+client.version, endpointPath));
}

function Routific(configuration) {
  this.url = getConfig(configuration, 'url');
  this.version = getConfig(configuration, 'version');
};

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
