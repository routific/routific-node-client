var request = require("request");
var url = require("url");
var path = require("path");

var Vrp = require("./vrp")
var Pdp = require("./pdp")

var baseConfig = {
  url: "https://api.routific.com",
  pollDelay: 1000, // in milliseconds
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

// Performs an http request
function httpRequest(client, endpointPath, opts, cb) {
  reqOpts = {
    url: endpoint(client, endpointPath)
  }
  for(var k in opts){
    reqOpts[k] = opts[k]
  }
  if (client.token) {
    reqOpts.headers = reqOpts.headers || {};
    reqOpts.headers["Authorization"] = "bearer " + client.token;
  }
  request(reqOpts, function(err, response, body) {
    if (err)
      return cb(err)
    if (body.error)
      return cb(new Error(body.error))
    if (body.status === 'error')
      return cb(new Error(body.output))
    cb(undefined, body)
  });
}

// Performs a POST request
function postRequest(client, endpoint, data, cb) {
  httpRequest(client, endpoint, {method: "POST", json: data}, cb)
}

// Performs a GET request
function getRequest(client, endpoint, cb) {
  httpRequest(client, endpoint, {method: "GET", json: true}, cb)
}

// Constructor for the routific client object
function Routific(configuration) {
  this.url = getConfig(configuration, 'url');
  this.version = getConfig(configuration, 'version');
  this.token = getConfig(configuration, 'token');
  this.pollDelay = getConfig(configuration, 'pollDelay');
  if (this.pollDelay < 100)
    this.pollDelay = 100;
};

// Performs a call to the login endpoint.
// The callback will be called with `error` and `body`, being `body` the
//   parsed body of the response.
Routific.prototype.login = function(email, password, cb) {
  var self = this;
  data = {email: email, password: password};
  postRequest(self, "/users/login", data, function(err, body) {
    if (err)
      return cb(err)
    self.token = body.token
    cb(undefined, body)
  });
};

// Performs a call to the long routing endpoints and waits until it finishes.
Routific.prototype.route = function(problem, cb) {
  var self = this;
  var routeEndpoint = problem.constructor.routingLongEndpoint;
  postRequest(self, routeEndpoint, problem.data, function(err, body) {
    if (err)
      return cb(err)
    self.jobPoll(body.job_id, function(err, jobResponse){
      if (err)
        return cb(err)

      cb(undefined, jobResponse.output)
    })
  });
};

// Performs a call to the jobs endpoint.
Routific.prototype.job = function(jobId, cb) {
  getRequest(this, "/jobs/"+jobId, cb);
};

// Performs calls to the jobs endpoint until it is processed.
Routific.prototype.jobPoll = function(jobId, cb) {
  var self = this;
  getRequest(this, "/jobs/"+jobId, function(err, res) {
    if (err)
      return cb(err)
    if (res.status != "finished"){
      setTimeout(function(){
        self.jobPoll(jobId, cb)
      }, self.pollDelay);
      return
    }
    cb(undefined, res)
  });
};

module.exports = Routific
