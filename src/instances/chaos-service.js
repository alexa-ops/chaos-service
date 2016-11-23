'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

const imageService = require('./image-service');
const instanceService = require('./instance-service');

const getRandomInstanceIds = (ec2, numInstances) => {
    return instanceService
            .list(ec2)
            .then((instances) => {
                console.log('List results', instances);
                const instanceIds = instances.map(i => i.InstanceId);
                return _.take(_.shuffle(instanceIds), numInstances);
            });
}

const getImageIds = (ec2) => {
    return imageService.list(ec2).then(result => {
        console.log('Retrieved Images', result);
        return result.Images.map(image => image.ImageId);
    });
}

const start = (ec2, imageId, instanceSize, numInstances) => {
    console.log('Starting instaces', { imageId, instanceSize, numInstances });
    return instanceService.create(ec2, imageId, 'chaos-time', instanceSize, numInstances)
}

const stop = (ec2, numInstances) => {
    console.log('Stopping instaces', { numInstances });
    return getRandomInstanceIds(ec2, numInstances).then((instanceIds) =>
        instanceService.stop(ec2, instanceIds)
    );
};

const terminate = (ec2, numInstances) => {
    console.log('Terminating instaces', { numInstances });

    return getRandomInstanceIds(ec2, numInstances).then((instanceIds) =>
        instanceService.terminate(ec2, instanceIds)
    );
};


module.exports = {
    start,
    stop,
    terminate,
}
