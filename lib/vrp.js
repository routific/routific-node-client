// Constructor for the VRP objects
function Vrp() {
  this.data = {
    visits: {},
    fleet: {}
  }
};

Vrp.prototype.addVisit = function(id, visit) {
  this.data.visits[id] = visit;
}

Vrp.prototype.addVehicle = function(id, vehicle) {
  this.data.fleet[id] = vehicle;
}

module.exports = Vrp
