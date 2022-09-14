export class Pdp {
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

  static routingShortEndpoint = 'pdp'
  static routingLongEndpoint = 'pdp-long'
}
