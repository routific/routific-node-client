[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Routific npm module

This node library is a client to interact with the [Routific API](http://docs.routific.com/)

# Usage

Install the npm module:

```
npm install routific
```

A simple login example:

```javascript
import { Routific, Vrp, Pdp } from 'routific'

client = new Client()

const response = await client.login('test@test.com', '123456')
```

Routific don't depend on any http library so it relays on `globalThis.fetch` to
make the request. to make it Deno friendly. Therefore NodeJS v18 is recommended.
But if you can't upgrade to node v18 then you could bring in your own fetch impl

```js
import fetch from 'node-fetch'

const client = new Client()
client.onfetch = (url, options) => {
    return fetch(url, options)
}
```
This can also be used for just monitoring all request that we make or use it to
modify the request before it's being sent. Like adding a abort signal or handle
the request manually yourself.

It dose not need to return a full Response class...
you can also just return a regular object

```js
client.onfetch = (url, options) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    ...
    xhr.send()

    return xhr.response || { }
}
```

# Initialization

The Routific `Client` constructor accepts an optional configuration object as a first argument.

```javascript
client = new Routific(options);
```

Valid options:
- `url`: Routific API url. This is for internal use only. Default `"https://api.routific.com"`.
- `version`: Version of the API to use. Default `1`.
- `token`: User token to use for authenticated operations. This is optional, performing a login will set it too. Default `null`.
- `pollDelay`: Milliseconds between attempts to check if jobs are finished when processing routes. Default `1000`.


# Operations

## Login

It calls the Login endpoint and keeps the received token for the following authenticated calls.

```javascript
const response = await client.login(email, password)
```

## VRP route

It calls the VRP endpoint (long version) and waits until the job is processed. It returns the job output, as it would do calling the short VRP endpoint.

```javascript
import { Vrp } from 'routific'

vrp = new Vrp()
vrp.addVisit('visitID1', {
    location: {
        name: 'Visit1 name',
        lat: 49.227607,
        lng: -123.1363085
    },
    start: '8:00',
    end: '16:00',
    duration: 10
})
vrp.addVehicle('vehicleID1', {
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
vrp.addOption('traffic', 'slow')
const { solution, jobId } = await client.route(vrp)
```

## PDP route

It calls the PDP endpoint (long version) and waits until the job is processed. It returns the job output, as it would do calling the short PDP endpoint.

```javascript
import { Pdp } from 'routific'

const pdp = new Pdp();
pdp.addVisit('visitID1', {
    pickup: {
        location: {
            name: 'Visit1 pickup name',
            lat: 49.227607,
            lng: -123.1363085
        },
        start: '8:00',
        end: '16:00',
        duration: 10
    },
    dropoff: {
        location: {
            name: 'Visit1 dropoff name',
            lat: 48.227607,
            lng: -122.1363085
        },
        start: '8:00',
        end: '16:00',
        duration: 10
    }
})
pdp.addVehicle('vehicleID1', {
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
pdp.addOption('traffic', 'slow')

const { solution, jobId } = await client.route(pdp)
```
