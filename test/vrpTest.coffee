chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'VRP', ->
  it 'sends the request to the vrp-long and jobs endpoints', (done) ->
    client = new Routific.Client(token: '1234')
    visit1 =
      location:
        name: "Order 1 street"
        lat: 49.227607
        lng: -123.1363085
    visit2 =
      location:
        name: "Order 2 street"
        lat: 49.227107
        lng: -123.1163085
    vehicle =
      start_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365
      end_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365

    nock client.url,
      reqheaders:
        "Authorization": "bearer 1234"
    .post "/v#{client.version}/vrp-long",
      visits:
        o1: visit1
        o2: visit2
      fleet:
        v1: vehicle
    .reply 200,
      job_id: "abcde"

    nock client.url,
      reqheaders:
        "Authorization": "bearer 1234"
    .get "/v#{client.version}/jobs/abcde"
    .reply 200,
      status: 'finished'
      output:
        num_unserved: 1

    vrp = new Routific.Vrp()
    vrp.addVisit("o1", visit1)
    vrp.addVisit("o2", visit2)
    vrp.addVehicle("v1", vehicle)

    client.route vrp, (error, solution) ->
      return done(err) if err?
      expect(solution.num_unserved).to.eq(1)
      done()
