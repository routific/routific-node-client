chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'VRP', ->
  it 'sends the request to the vrp-long and jobs endpoints', (done) ->
    client = new Routific.Client(token: '1234')
    nock(client.url).post "/v#{client.version}/vrp-long",
      {}
    .reply 200,
      {}

    vrp = new Routific.Vrp()
    vrp.addVisit
      id: "o1"
      location:
        name: "Order 1 street"
        lat: 49.227107
        lng: -123.1163085

    vrp.addVehicle
      id: "v1"
      start_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365
      end_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365

    client.route vrp, (error, data) ->
      return done(err) if err?
      done()
