// Constructor for the VRP objects
function Vrp() {
  this.data = {
    visits: {},
    fleet: {},
    options: {}
  }
};

Vrp.routingShortEndpoint = "/vrp"
Vrp.routingLongEndpoint = "/vrp-long"

Vrp.prototype.addVisit = function(id, visit) {
  this.data.visits[id] = visit;
}

Vrp.prototype.removeVisit = function(id) {
  delete this.data.visits[id];
}

Vrp.prototype.addVehicle = function(id, vehicle) {
  this.data.fleet[id] = vehicle;
}

Vrp.prototype.removeVehicle = function(id) {
  delete this.data.fleet[id];
}

Vrp.prototype.addOption = function(id, option) {
  this.data.options[id] = option;
}

module.exports = Vrp
