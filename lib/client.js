import request from 'request'

const sleep = ms => new Promise(rs => setTimeout(rs, ms))

const baseConfig = {
  url: 'https://api.routific.com',
  pollDelay: 1000, // in milliseconds
  version: 1
}

const JobStatus = Object.freeze({
  ERROR: 'error',
  PROCESSING: 'processing',
  FINISHED: 'finished'
})

// Gets a configuration value from either the `configuration` or the default
function getConfig (configuration, key) {
  if (configuration && configuration.hasOwnProperty(key)) { return configuration[key] }
  return baseConfig[key]
}

export class Routific {
  /**
   * @param {string} url
   * @param {RequestInit} options
   */
  onfetch = (url, options) => globalThis.fetch(url, options)

  constructor (configuration) {
    this.url = getConfig(configuration, 'url')
    this.version = getConfig(configuration, 'version')
    this.token = getConfig(configuration, 'token')
    this.pollDelay = getConfig(configuration, 'pollDelay')
    if (this.pollDelay < 100) { this.pollDelay = 100 }
  }

  async #toRequest (endpointPath, data) {
    const url = `${this.url}/v${this.version}/${endpointPath}`
    const request = {
      ...data && {
        body: JSON.stringify(data),
        method: 'POST'
      },
      headers: {
        'content-type': 'application/json'
      }
    }

    if (this.token) {
      request.headers.authorization = 'bearer ' + this.token
    }

    const response = await this.onfetch(url, request)
    const json = await response?.json() || response

    if (json.error) throw new Error(json.error)
    if (json.status === 'error') throw new Error(json.output)

    return json
  }

  // Performs a call to the login endpoint.
  // The callback will be called with `error` and `body`, being `body` the
  //   parsed body of the response.
  async login (email, password, cb) {
    const data = { email, password }
    const json = await this.#toRequest('users/login', data)
    this.token = json.token
    return json
  }

  // Performs a call to the long routing endpoints and waits until it finishes.
  async route (problem) {
    const routeEndpoint = problem.constructor.routingLongEndpoint
    const json = await this.#toRequest(routeEndpoint, problem.data)
    const jobResponse = await this.jobPoll(json.job_id)

    return {
      jobId: json.job_id,
      solution: jobResponse.output
    }
  }

  // Performs a call to the jobs endpoint.
  job (jobId) {
    return this.#toRequest('jobs/' + jobId)
  }

  // Performs calls to the jobs endpoint until it is processed.
  async jobPoll (jobId) {
    const json = await this.#toRequest('jobs/' + jobId)
    if (json.status !== JobStatus.FINISHED) {
      await sleep(this.pollDelay)
      return this.jobPoll(jobId)
    }

    return json
  }
}
