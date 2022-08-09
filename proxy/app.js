require('dotenv').config()
const express = require('express');
const axios = require('axios')
const rateLimit = require('express-rate-limit')
const bodyParser = require('body-parser');

// Constants
const PORT = process.env.PORT ? process.env.PORT : 80;
const HOST = process.env.HOST ? process.env.HOST : '0.0.0.0';
const VALID_TKN = process.env.VALID_TKN ? process.env.VALID_TKN : 'anauthenticationtokenhere'
const REDIRECT_HOST = process.env.REDIRECT_HOST ? process.env.REDIRECT_HOST : '0.0.0.0'
const REDIRECT_PORT = process.env.REDIRECT_PORT
const REDIRECT_URL = REDIRECT_PORT ? REDIRECT_HOST + `:${REDIRECT_PORT}` : REDIRECT_HOST

// Rate limit
const limiter = rateLimit({
	windowMs: 60 * 1000, // 60 secs
	max: 30, // Limit each IP to 20 requests per `window` (here, per 1 second)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// App
const app = express()
app.use(limiter) // enable rate limit on every endpoint
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.json());

// Routes
app.all('*', async (req, res) => {
  try {
    console.log(`${req.method}: ${req.protocol}://${req.get('host')}${req.originalUrl} - HEADERS: ${JSON.stringify(req.headers)}`)
  } catch(err) {}
  let path = req.path
  let method = req.method
  let headers = req.headers
  let data = req.body
  let token = ''
  if (headers['authorization'] || headers['x-algo-api-token'] || headers['x-api-key']) {
    if (headers['authorization']) token = headers['authorization'].split(' ')[1]
    if (headers['x-api-key']) headers['x-algo-api-token'] = headers['x-api-key']
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
        console.log({
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
