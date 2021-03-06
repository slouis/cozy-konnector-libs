/**
 * This is a [cozy-client-js](https://cozy.github.io/cozy-client-js/) instance already initialized and ready to use
 *
 * If you want to access cozy-client-js directly, this method gives you directly an instance of it,
 * initialized according to `COZY_URL` and `COZY_CREDENTIALS` environment variable given by cozy-stack
 * You can refer to the [cozy-client-js documentation](https://cozy.github.io/cozy-client-js/) for more information.
 *
 * Example :
 *
 * ```javascript
 * const {cozyClient} = require('cozy-konnector-libs')
 *
 * cozyClient.data.defineIndex('my.doctype', ['_id'])
 * ```
 * @module cozyClient
 */

const {Client, MemoryStorage} = require('cozy-client-js')

const getCredentials = function (environment) {
  try {
    if (environment === 'development') {
      const credentials = JSON.parse(process.env.COZY_CREDENTIALS)
      credentials.token.toAuthHeader = function () {
        return 'Bearer ' + credentials.client.registrationAccessToken
      }
      return credentials
    } else {
      return process.env.COZY_CREDENTIALS.trim()
    }
  } catch (err) {
    console.error(`Please provide proper COZY_CREDENTIALS environment variable. ${process.env.COZY_CREDENTIALS} is not OK`)
    throw err
  }
}

const getCozyUrl = function () {
  if (process.env.COZY_URL === undefined) {
    console.error(`Please provide COZY_URL environment variable.`)
    throw new Error('COZY_URL environment variable is absent/not valid')
  } else {
    return process.env.COZY_URL
  }
}

const getCozyClient = function (environment = 'production') {
  if (environment === 'standalone' || environment === 'test') {
    return require('../helpers/cozy-client-js-stub')
  }

  const credentials = getCredentials(environment)
  const cozyURL = getCozyUrl()

  const options = {
    cozyURL: cozyURL
  }

  if (environment === 'development') {
    options.oauth = {storage: new MemoryStorage()}
  } else if (environment === 'production') {
    options.token = credentials
  }

  const cozyClient = new Client(options)

  if (environment === 'development') {
    cozyClient.saveCredentials(credentials.client, credentials.token)
  }

  return cozyClient
}

module.exports = getCozyClient(process.env.NODE_ENV)
