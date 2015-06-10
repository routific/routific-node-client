chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'login', ->
  it 'sends the request to the login endpoint', (done) ->
    client = new Routific.Client()
    nock(client.url).post "/v#{client.version}/users/login",
      email: "test@test.com",
      password: "testing"
    .reply 200,
      token: 'yourToken'
      _id: 'yourID'

    client.login "test@test.com", "testing", (err, data) ->
      return done(err) if err?
      expect(data._id).to.eq("yourID")
      expect(data.token).to.eq("yourToken")
      done()

  it 'stores the new token', (done) ->
    client = new Routific.Client()
    nock(client.url).post "/v#{client.version}/users/login",
      email: "test@test.com",
      password: "testing"
    .reply 200,
      token: 'yourToken'
      _id: 'yourID'

    client.login "test@test.com", "testing", (err, data) ->
      return done(err) if err?
      expect(client.token).to.eq("yourToken")
      done()

  it 'overrides an existing token', (done) ->
    client = new Routific.Client(token: "oldToken")
    nock(client.url).post "/v#{client.version}/users/login",
      email: "test@test.com",
      password: "testing"
    .reply 200,
      token: 'yourToken'
      _id: 'yourID'

    expect(client.token).to.eq("oldToken")
    client.login "test@test.com", "testing", (err, data) ->
      return done(err) if err?
      expect(client.token).to.eq("yourToken")
      done()

