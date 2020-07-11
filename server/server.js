// do this first!
require('dotenv-flow').config();

const morgan = require('morgan')
const bodyParser = require('body-parser');
const express = require('express');
const { bottender } = require('bottender');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 5000;

// the request handler of the bottender app
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // log all requests
  server.use(morgan('combined'))

  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };

  server.use(bodyParser.json({ verify }));
  server.use(bodyParser.urlencoded({ extended: false, verify }));

  // your custom route
  server.get('/api', (req, res) => {
    console.log('api call')
    res.json({ ok: true });
  });

  console.log('serving public and build dirs')
  server.use(express.static('public'))
  server.use(express.static('build'))

  // route for webhook request
  // do this last
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  console.log('using SLACK_ACCESS_TOKEN', process.env.SLACK_ACCESS_TOKEN)

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});

module.exports = require('./src/botRoutes');
