'use strict';

const _ = require('lodash');

const instanceService = require('./instance-service');

const getRandomInstanceIds = (ec2, numInstances) => {
    return instanceService
        .list(ec2, 'running')
        .then((instances) => {
            console.log('List results', instances);
            const instanceIds = instances.map(i => i.InstanceId);
            return _.take(_.shuffle(instanceIds), numInstances);
        });
}

const start = (ec2, imageId, instanceSize, numInstances) => {
    console.log('Starting instaces', {
        imageId,
        instanceSize,
        numInstances
    });
    return instanceService.create(ec2, imageId, 'chaos-time', instanceSize, numInstances)
}

const stop = (ec2, numInstances) => {
    console.log('Stopping instaces', {
        numInstances
    });
    return getRandomInstanceIds(ec2, numInstances).then((instanceIds) =>
        instanceService.stop(ec2, instanceIds)
    );
};

const terminate = (ec2, numInstances) => {
    console.log('Terminating instaces', {
        numInstances
    });

    return getRandomInstanceIds(ec2, numInstances).then((instanceIds) =>
        instanceService.terminate(ec2, instanceIds)
    ).then(terminateResult => {
        const result = {
            terminate: terminateResult
        };
        return instanceService
            .countBy(ec2, 'state')
            .then(count => {
                result.count = count;
                return result;
            })
            .catch(err => {
                console.log(err);
                return result;
            });
    });
};


module.exports = {
    start,
    stop,
    terminate,
}
