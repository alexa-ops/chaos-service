'use strict';

const AWS = require('aws-sdk');
const instanceService = require('./instance-service');

const ec2 = new AWS.EC2();

// {
//   "state": "" // running, stopped ect
// }

module.exports.handler = (event, context, callback) => {
    return instanceService
        .list(ec2)
        .then((result) => callback(null, result))
        .catch(err => callback(err));
};
