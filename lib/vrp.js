export class Vrp {
  data = {
    visits: {},
    fleet: {},
    options: {}
  }

  addVisit (id, visit) {
    this.data.visits[id] = visit
  }

  addVehicle (id, vehicle) {
    this.data.fleet[id] = vehicle
  }

  addOption (id, option) {
    this.data.options[id] = option
  }

  static routingShortEndpoint = 'vrp'
  static routingLongEndpoint = 'vrp-long'
}
