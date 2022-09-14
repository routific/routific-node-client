import { equal, deepEqual } from 'node:assert/strict'
import { Routific, Pdp } from '../index.js'

const getPdp = function () {
  const pdp = new Pdp()
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

describe('PDP', function () {
  it('sends the request to the pdp-long and jobs endpoints', async () => {
    const client = new Routific({ token: '1234' })
    const pdp = getPdp()
    client.onfetch = async (url, options) => {
      const req = new Request(url, options)
      equal(req.url, `https://api.routific.com/v1/pdp-long`)
      equal(req.method, 'POST')
      equal(req.headers.get('authorization'), 'bearer 1234')
      const body = await req.json()
      deepEqual(body, {
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
      })

      client.onfetch = async (url, options) => {
        const req = new Request(url, options)
        equal(req.url, `https://api.routific.com/v1/jobs/abcde`)
        equal(req.method, 'GET')
        equal(req.headers.get('authorization'), 'bearer 1234')
        return new Response(JSON.stringify({
          status: 'finished',
          output: { num_unserved: 1 }
        }))
      }
      return new Response('{"job_id":"abcde"}')
    }

    const { solution, jobId } = await client.route(pdp)
    equal(solution.num_unserved, 1)
    equal(jobId, 'abcde')
  })

  it('retries fetching the job until it is done', async () => {
    const client = new Routific({ token: '1234', pollDelay: 100 })
    const pdp = getPdp()
    client.onfetch = async (url, options) => {
      const req = new Request(url, options)
      equal(req.url, `https://api.routific.com/v1/pdp-long`)
      equal(req.method, 'POST')
      equal(req.headers.get('authorization'), 'bearer 1234')
      const body = await req.json()
      deepEqual(body, {
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
      })

      client.onfetch = async (url, options) => {
        const req = new Request(url, options)
        equal(req.url, `https://api.routific.com/v1/jobs/abcde`)
        equal(req.method, 'GET')
        equal(req.headers.get('authorization'), 'bearer 1234')

        client.onfetch = async (url, options) => {
          return new Response(JSON.stringify({
            status: 'finished',
            output: { num_unserved: 1 }
          }))
        }

        return new Response(JSON.stringify({
          status: 'pending'
        }))
      }

      return new Response('{"job_id":"abcde"}')
    }

    const { solution, jobId } = await client.route(pdp)
    equal(solution.num_unserved, 1)
    equal(jobId, 'abcde')
  })
})
