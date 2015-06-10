// Constructor for the VRP objects
function Vrp() {
  this.data = {
    visits: [],
    fleet: []
  }
};

Vrp.prototype.addVisit = function(visit) {
  this.data.visits.push(visit)
}

Vrp.prototype.addVehicle = function(vehicle) {
  this.data.fleet.push(vehicle)
}

module.exports = Vrp
