import { equal, deepEqual } from 'node:assert/strict'
import { Routific, Vrp } from '../index.js'

const getVrp = function () {
  const vrp = new Vrp()
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

describe('VRP', function () {

  it('sends the request to the vrp-long and jobs endpoints', async () => {
    const client = new Routific({ token: '1234' })
    const vrp = getVrp()
    client.onfetch = async (url, options) => {
      const req = new Request(url, options)
      equal(req.url, `${client.url}/v${client.version}/vrp-long`)
      equal(req.method, 'POST')
      equal(req.headers.get('authorization'), 'bearer 1234')
      const body = await req.json()
      deepEqual(body, {
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
      })

      client.onfetch = async (url, options) => {
        const req = new Request(url, options)
        equal(req.url, `${client.url}/v${client.version}/jobs/abcde`)
        equal(req.method, 'GET')
        equal(req.headers.get('authorization'), 'bearer 1234')
        return new Response(JSON.stringify({
          status: 'finished',
          output: { num_unserved: 1 }
        }), { status: 200 })
      }
      return new Response(JSON.stringify({ job_id: 'abcde' }), { status: 200 })
    }

    const {solution, jobId} = await client.route(vrp)
    equal(solution.num_unserved, 1)
    equal(jobId, 'abcde')
  })

  it('retries fetching the job until it is done', async () => {
    const client = new Routific({ token: '1234', pollDelay: 100 })
    const vrp = getVrp()
    client.onfetch = async (url, options) => {
      const req = new Request(url, options)
      equal(req.url, `${client.url}/v${client.version}/vrp-long`)
      equal(req.method, 'POST')
      equal(req.headers.get('authorization'), 'bearer 1234')
      const body = await req.json()
      deepEqual(body, {
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
      })

      client.onfetch = async (url, options) => {
        client.onfetch = async (url, options) => {
          return new Response(JSON.stringify({
            status: 'finished',
            output: { num_unserved: 1 }
          }))
        }
        return new Response(JSON.stringify({ status: 'pending' }))
      }
      return new Response(JSON.stringify({ job_id: 'abcde' }), { status: 200 })
    }

    const { solution, jobId } = await client.route(vrp)
    equal(solution.num_unserved, 1)
    equal(jobId, 'abcde')

  })
})
