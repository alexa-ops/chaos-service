'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

const promisfy = (obj) => BbPromise.promisifyAll(obj);

const list = (ec2) => {
    promisfy(ec2);

    const params = {
        Owners: ['self', 'amazon'],
    };

    return ec2.describeImagesAsync(params);
}


module.exports = {
    list,
};
