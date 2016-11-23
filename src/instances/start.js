'use strict';

const AWS = require('aws-sdk');
const chaosService = require('./chaos-service');

const ec2 = new AWS.EC2();

// {
//   "count": 3,
//   "size": "t2.nano"
// }

module.exports.handler = (event, context, callback) => {
    const imageId = process.env.AWS_AMI_ID;
    return chaosService
        .start(ec2, imageId, event.size, event.count)
        .then((result) => callback(null, result))
        .catch(err => callback(err));
};
