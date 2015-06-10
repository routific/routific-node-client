chai = require 'chai'
nock = require 'nock'
expect = chai.expect

Routific = require "../index"

describe 'login', ->
  it 'sends the request to the login endpoint', (done) ->
    client = new Routific()
    nock(client.url).post "/v#{client.version}/users/login",
      email: "test@test.com",
      password: "testing"
    .reply 200,
      _id: 'yourID'

    client.login "test@test.com", "testing", (err, data) ->
      return done(err) if err?
      expect(data._id).to.eq("yourID")
      done()

