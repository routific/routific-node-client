/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const chai = require('chai')
const nock = require('nock')
const {
  expect
} = chai

const Routific = require('../index')

describe('login', function () {
  it('sends the request to the login endpoint', function (done) {
    const client = new Routific.Client()
    nock(client.url).post(`/v${client.version}/users/login`, {
      email: 'test@test.com',
      password: 'testing'
    }).reply(200, {
      token: 'yourToken',
      _id: 'yourID'
    })

    return client.login('test@test.com', 'testing', function (err, data) {
      if (err != null) { return done(err) }
      expect(data._id).to.eq('yourID')
      expect(data.token).to.eq('yourToken')
      return done()
    })
  })

  it('stores the new token', function (done) {
    const client = new Routific.Client()
    nock(client.url).post(`/v${client.version}/users/login`, {
      email: 'test@test.com',
      password: 'testing'
    }).reply(200, {
      token: 'yourToken',
      _id: 'yourID'
    })

    return client.login('test@test.com', 'testing', function (err, data) {
      if (err != null) { return done(err) }
      expect(client.token).to.eq('yourToken')
      return done()
    })
  })

  return it('overrides an existing token', function (done) {
    const client = new Routific.Client({ token: 'oldToken' })
    nock(client.url).post(`/v${client.version}/users/login`, {
      email: 'test@test.com',
      password: 'testing'
    }).reply(200, {
      token: 'yourToken',
      _id: 'yourID'
    })

    expect(client.token).to.eq('oldToken')
    return client.login('test@test.com', 'testing', function (err, data) {
      if (err != null) { return done(err) }
      expect(client.token).to.eq('yourToken')
      return done()
    })
  })
})
