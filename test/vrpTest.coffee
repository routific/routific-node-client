chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'VRP', ->
  getVrp = ->
    vrp = new Routific.Vrp()
    vrp.addVisit "o1",
      location:
        name: "Order 1 street"
        lat: 49.227607
        lng: -123.1363085
    vrp.addVisit "o2",
      location:
        name: "Order 2 street"
        lat: 49.227107
        lng: -123.1163085
    vrp.addVehicle "v1",
      start_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365
      end_location:
        id: "depot"
        lat: 49.2553636
        lng: -123.0873365
    vrp.addOption "traffic", "fast"
    return vrp

  it 'sends the request to the vrp-long and jobs endpoints', (done) ->
    client = new Routific.Client(token: '1234')
    vrp = getVrp()
    nock client.url,
      reqheaders:
        "Authorization": "bearer 1234"
    .post "/v#{client.version}/vrp-long",
      visits:
        o1: vrp.data.visits.o1
        o2: vrp.data.visits.o2
      fleet:
        v1: vrp.data.fleet.v1
      options:
        traffic: vrp.data.options.traffic
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

    client.route vrp, (error, solution) ->
      return done(err) if err?
      expect(solution.num_unserved).to.eq(1)
      done()

  it 'retries fetching the job until it is done', (done) ->
    client = new Routific.Client(token: '1234', pollDelay: 100)
    vrp = getVrp()
    nock client.url,
      reqheaders:
        "Authorization": "bearer 1234"
    .post "/v#{client.version}/vrp-long",
      visits:
        o1: vrp.data.visits.o1
        o2: vrp.data.visits.o2
      fleet:
        v1: vrp.data.fleet.v1
      options:
        traffic: vrp.data.options.traffic
    .reply 200,
      job_id: "abcde"

    jobCalls = nock client.url,
      reqheaders:
        "Authorization": "bearer 1234"
    .get "/v#{client.version}/jobs/abcde"
    .reply 200,
      status: 'pending'
    .get "/v#{client.version}/jobs/abcde"
    .reply 200,
      status: 'finished'
      output:
        num_unserved: 1

    client.route vrp, (error, solution) ->
      return done(err) if err?
      jobCalls.done()
      done()
