'use strict';

const AWS = require('aws-sdk');
const instanceService = require('./instance-service');

const ec2 = new AWS.EC2();

// {
//   "selector": "state" // az, name, size, state
// }

module.exports.handler = (event, context, callback) => {
    return instanceService
        .countBy(ec2, event.selector)
        .then((result) => callback(null, result))
        .catch(err => callback(err));
};
