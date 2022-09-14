const chai = require('chai')
const nock = require('nock')
const { expect } = chai

const Routific = require('../index.js')

describe('PDP', function () {
  const getPdp = function () {
    const pdp = new Routific.Pdp()
    pdp.addVisit('o1', {
      pickup: {
        location: {
          name: 'Order 1 pickup street',
          lat: 49.227607,
          lng: -123.1363085
        }
      },
      dropoff: {
        location: {
          name: 'Order 1 dropoff street',
          lat: 49.327607,
          lng: -123.2363085
        }
      }
    }
    )
    pdp.addVisit('o2', {
      pickup: {
        location: {
          name: 'Order 2 pickup street',
          lat: 49.227107,
          lng: -123.1163085
        }
      },
      dropoff: {
        location: {
          name: 'Order 2 dropoff street',
          lat: 49.327107,
          lng: -123.2163085
        }
      }
    }
    )
    pdp.addVehicle('v1', {
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
    }
    )
    pdp.addOption('balance', true)
    return pdp
  }

  it('sends the request to the pdp-long and jobs endpoints', function (done) {
    const client = new Routific.Client({ token: '1234' })
    const pdp = getPdp()
    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).post(`/v${client.version}/pdp-long`, {
      visits: {
        o1: pdp.data.visits.o1,
        o2: pdp.data.visits.o2
      },
      fleet: {
        v1: pdp.data.fleet.v1
      },
      options: {
        balance: pdp.data.options.balance
      }
    }).reply(200,
      { job_id: 'abcde' })

    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).get(`/v${client.version}/jobs/abcde`)
      .reply(200, {
        status: 'finished',
        output: {
          num_unserved: 1
        }
      }
      )

    return client.route(pdp, function (error, solution, jobId) {
      if (error != null) { return done(error) }
      expect(solution.num_unserved).to.eq(1)
      expect(jobId).to.exist
      return done()
    })
  })

  return it('retries fetching the job until it is done', function (done) {
    const client = new Routific.Client({ token: '1234', pollDelay: 100 })
    const pdp = getPdp()
    nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).post(`/v${client.version}/pdp-long`, {
      visits: {
        o1: pdp.data.visits.o1,
        o2: pdp.data.visits.o2
      },
      fleet: {
        v1: pdp.data.fleet.v1
      },
      options: {
        balance: pdp.data.options.balance
      }
    }).reply(200,
      { job_id: 'abcde' })

    const jobCalls = nock(client.url, {
      reqheaders: {
        Authorization: 'bearer 1234'
      }
    }).get(`/v${client.version}/jobs/abcde`)
      .reply(200,
        { status: 'pending' })
      .get(`/v${client.version}/jobs/abcde`)
      .reply(200, {
        status: 'finished',
        output: {
          num_unserved: 1
        }
      }
      )

    return client.route(pdp, function (error, solution, jobId) {
      if (error != null) { return done(error) }
      jobCalls.done()
      return done()
    })
  })
})
