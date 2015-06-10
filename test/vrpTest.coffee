chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'VRP', ->
  it 'sends the request to the vrp-long and jobs endpoints', (done) ->
    client = new Routific.Client(token: '1234')
    visit1 =
      id: "o1"
      location:
        name: "Order 1 street"
        lat: 49.227607
        lng: -123.1363085
    visit2 =
      id: "o2"
      location:
        name: "Order 2 street"
        lat: 49.227107
        lng: -123.1163085
    vehicle =
      id: "v1"
      start_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365
      end_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365

    nock(client.url).post "/v#{client.version}/vrp-long",
      visits: [visit1, visit2]
      fleet: [vehicle]
    .reply 200,
      job_id: "abcde"

    nock(client.url).get "/v#{client.version}/jobs/abcde"
    .reply 200,
      status: 'finished'
      output:
        num_unserved: 1

    vrp = new Routific.Vrp()
    vrp.addVisit(visit1)
    vrp.addVisit(visit2)
    vrp.addVehicle(vehicle)

    client.route vrp, (error, solution) ->
      return done(err) if err?
      expect(solution.num_unserved).to.eq(1)
      done()
