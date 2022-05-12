require('dotenv').config()
const express = require('express');
const axios = require('axios')
const rateLimit = require('express-rate-limit')

// Constants
const PORT = process.env.PORT ? process.env.PORT : 80;
const HOST = process.env.HOST ? process.env.HOST : '0.0.0.0';
const VALID_TKN = process.env.VALID_TKN ? process.env.VALID_TKN : 'anauthenticationtokenhere'
const REDIRECT_HOST = process.env.REDIRECT_HOST ? process.env.REDIRECT_HOST : '0.0.0.0'
const REDIRECT_PORT = process.env.REDIRECT_PORT
const REDIRECT_URL = REDIRECT_PORT ? REDIRECT_HOST + `:${REDIRECT_PORT}` : REDIRECT_HOST

// Rate limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// App
const app = express()
app.use(limiter) // enable rate limit on every endpoint

// Routes
app.get('*', async (req, res) => {
  let path = req.path
  let method = req.method
  let headers = req.headers
  let data = req.data
  let token = ''
  if (headers['authorization'] || headers['x-algo-api-token']) {
    if (headers['authorization']) token = headers['authorization'].split(' ')[1]
    if (headers['x-algo-api-token']) token = headers['x-algo-api-token']
    if (token == VALID_TKN) {
      try {
        let full_url = REDIRECT_URL + path
        let { data: resp } = await axios({
          method: method,
          url: full_url,
          data: data,
          headers: headers
        })
        return res.send(resp)
      } catch(err) {
        return res.send(err);
      }
    }
    return res.send({ success: false, message: 'please provide a valid auth token'})
  }
  return res.send({ success: false, message: 'please provide a valid auth token'})
})

// Start server
app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)