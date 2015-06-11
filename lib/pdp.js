// Constructor for the PDP objects
function Pdp() {
  this.data = {
    visits: {},
    fleet: {}
  }
};

Pdp.routingShortEndpoint = "/pdp"
Pdp.routingLongEndpoint = "/pdp-long"

Pdp.prototype.addVisit = function(id, visit) {
  this.data.visits[id] = visit;
}

Pdp.prototype.addVehicle = function(id, vehicle) {
  this.data.fleet[id] = vehicle;
}

module.exports = Pdp
