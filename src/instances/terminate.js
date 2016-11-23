'use strict';

const AWS = require('aws-sdk');
const chaosService = require('./chaos-service');

const ec2 = new AWS.EC2();

// {
//   "count": 3
// }

module.exports.handler = (event, context, callback) => {
    return chaosService
        .terminate(ec2, event.count)
        .then((result) => callback(null, result))
        .catch(err => callback(err));
};
