// Constructor for the PDP objects
function Pdp() {
  this.data = {
    visits: {},
    fleet: {},
    options: {}
  }
};

Pdp.routingShortEndpoint = "/pdp"
Pdp.routingLongEndpoint = "/pdp-long"

Pdp.prototype.addVisit = function(id, visit) {
  this.data.visits[id] = visit;
}

Pdp.prototype.removeVisit = function(id) {
  delete this.data.visits[id];
}

Pdp.prototype.addVehicle = function(id, vehicle) {
  this.data.fleet[id] = vehicle;
}

Pdp.prototype.removeVehicle = function(id) {
  delete this.data.fleet[id];
}

Pdp.prototype.addOption = function(id, option) {
  this.data.options[id] = option;
}

module.exports = Pdp
