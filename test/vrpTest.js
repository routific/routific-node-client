const chai = require('chai')
const nock = require('nock')
const { expect } = chai

const Routific = require('../index.js')

describe('VRP', function () {
  const getVrp = function () {
    const vrp = new Routific.Vrp()
    vrp.addVisit('o1', {
      location: {
        name: 'Order 1 street',
        lat: 49.227607,
        lng: -123.1363085
      }
    })
    vrp.addVisit('o2', {
      location: {
        name: 'Order 2 street',
        lat: 49.227107,
        lng: -123.1163085
      }
    })
    vrp.addVehicle('v1', {
      start_location: {
        id: 'depot',
        lat: 49.2553636,
        lng: -123.0873365
      },
      end_location: {
        id: 'depot',
        lat: 49.2553636,
        lng: -123.0873365
      }
    })
    vrp.addOption('traffic', 'fast')
    return vrp
  }

  it('sends the request to the vrp-long and jobs endpoints', function (done) {
    const client = new Routific.Client({ token: '1234' })
    const vrp = getVrp()
    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).post(`/v${client.version}/vrp-long`, {
      visits: {
        o1: vrp.data.visits.o1,
        o2: vrp.data.visits.o2
      },
      fleet: {
        v1: vrp.data.fleet.v1
      },
      options: {
        traffic: vrp.data.options.traffic
      }
    }).reply(200, { job_id: 'abcde' })

    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).get(`/v${client.version}/jobs/abcde`)
      .reply(200, {
        status: 'finished',
        output: { num_unserved: 1 }
      })

    return client.route(vrp, function (error, solution, jobId) {
      if (error != null) { return done(error) }
      expect(solution.num_unserved).to.eq(1)
      expect(jobId).to.exist
      return done()
    })
  })

  return it('retries fetching the job until it is done', function (done) {
    const client = new Routific.Client({ token: '1234', pollDelay: 100 })
    const vrp = getVrp()
    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).post(`/v${client.version}/vrp-long`, {
      visits: {
        o1: vrp.data.visits.o1,
        o2: vrp.data.visits.o2
      },
      fleet: {
        v1: vrp.data.fleet.v1
      },
      options: {
        traffic: vrp.data.options.traffic
      }
    }).reply(200,
      { job_id: 'abcde' })

    const jobCalls = nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).get(`/v${client.version}/jobs/abcde`)
      .reply(200, { status: 'pending' })
      .get(`/v${client.version}/jobs/abcde`)
      .reply(200, {
        status: 'finished',
        output: { num_unserved: 1 }
      })

    return client.route(vrp, function (error, solution, jobId) {
      if (error != null) { return done(error) }
      jobCalls.done()
      return done()
    })
  })
})
