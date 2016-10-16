'use strict';

require('dotenv').config();

// Setup env vars before requiring functions
const start = require('./start');
const stop = require('./stop');
const run = require('./run');

module.exports.start = start.handler;
module.exports.stop = stop.handler;
module.exports.run = run.handler;
