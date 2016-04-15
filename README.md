# Routific npm module
[![Build Status](https://magnum.travis-ci.com/axiomzen/routific-node-client.svg?token=srN8qsAuFiJpLCBPzvLf&branch=master)](https://magnum.travis-ci.com/axiomzen/routific-node-client)

This node library is a client to interact with the [Routific API](http://docs.routific.com/v1.0/docs/api-reference)

# Usage

Install the npm module:

```
npm install routific
```

A simple login example:

```javascript
Routific = require('routific');

client = new Routific.Client();

client.login("test@test.com", "123456", function(err, response){
    // ...
});
```


# Initialization

The Routific `Client` constructor accepts an optional configuration object as a first argument.

```javascript
client = new Routific.Client(options);
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
client.login(email, password, function(error, response){
    //...
})
```

## VRP route

It calls the VRP endpoint (long version) and waits until the job is processed. It returns the job output, as it would do calling the short VRP endpoint.

```javascript
vrp = new Routific.Vrp();
vrp.addVisit("visitID1", {
    location: {
        name: "Visit1 name",
        lat: 49.227607,
        lng: -123.1363085
    },
    start: "8:00",
    end: "16:00",
    duration: 10
});
vrp.addVehicle("vehicleID1", {
    start_location: {
        id: "depot",
        lat: 49.2553636,
        lng: -123.0873365
    },
    end_location: {
        id: "depot",
        lat: 49.2553636,
        lng: -123.0873365
    }
});
vrp.addOption("traffic", "slow");
client.route(vrp, function(err, solution){
    //...
})
```

## PDP route

It calls the PDP endpoint (long version) and waits until the job is processed. It returns the job output, as it would do calling the short PDP endpoint.

```javascript
pdp = new Routific.Pdp();
pdp.addVisit("visitID1", {
    pickup: {
        location: {
            name: "Visit1 pickup name",
            lat: 49.227607,
            -123.1363085
        },
        start: "8:00",
        end: "16:00",
        duration: 10
    },
    dropoff: {
        location: {
            name: "Visit1 dropoff name",
            lat: 48.227607,
            -122.1363085
        },
        start: "8:00",
        end: "16:00",
        duration: 10
    }
});
pdp.addVehicle("vehicleID1", {
    start_location: {
        id: "depot",
        lat: 49.2553636,
        lng: -123.0873365
    },
    end_location: {
        id: "depot",
        lat: 49.2553636,
        lng: -123.0873365
    }
});
pdp.addOption("traffic", "slow");
client.route(pdp, function(err, solution){
    //...
})
```
