import { equal } from 'node:assert/strict'
import { Routific } from '../index.js'

const response = new Response(JSON.stringify({
  token: 'yourToken',
  _id: 'yourID'
}))

describe('login', function () {
  it('sends the request to the login endpoint', async function () {
    const client = new Routific()
    client.onfetch = (url, request) => {
      equal(url, `${client.url}/v${client.version}/users/login`)
      equal(request.body, '{"email":"test@test.com","password":"testing"}')
      return response.clone()
    }

    const data = await client.login('test@test.com', 'testing')
    equal(data._id, 'yourID')
    equal(data.token, 'yourToken')
  })

  it('stores the new token', async function () {
    const client = new Routific()
    client.onfetch = (url, request) => {
      equal(url, `${client.url}/v${client.version}/users/login`)
      equal(request.body, '{"email":"test@test.com","password":"testing"}')
      return response.clone()
    }

    await client.login('test@test.com', 'testing')
    equal(client.token, 'yourToken')
  })

  it('overrides an existing token', async () => {
    const client = new Routific({ token: 'oldToken' })
    client.onfetch = (url, request) => {
      equal(url, `${client.url}/v${client.version}/users/login`)
      equal(request.body, '{"email":"test@test.com","password":"testing"}')
      return response.clone()
    }

    equal(client.token, 'oldToken')
    await client.login('test@test.com', 'testing')
    equal(client.token, 'yourToken')
  })
})
