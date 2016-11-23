'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

const promisfy = (obj) => BbPromise.promisifyAll(obj);

const instanceListParams = {
    Filters: [{
        Name: 'instance-state-name',
        Values: [
            'running',
        ]
    }]
};

const getInstancesPage = (ec2, params, currentInstances) => {
    return ec2
        .describeInstancesAsync(params)
        .then(result => {
            console.log('Retrieved page', result);
            const retrievedInstances = _.flatten(result.Reservations.map(r => r.Instances));
            console.log('Retrieved instances', retrievedInstances);

            const instances = _.concat(currentInstances, retrievedInstances);

            if (result.NextToken) {
                console.log('Getting next page');
                const params = _.assign({
                    NextToken: result.NextToken,
                }, instanceListParams);

                return getInstancesPage(ec2, params, instances)
            }

            return instances;
        });
};

const list = (ec2) => {
    promisfy(ec2);

    const params = _.assign({}, instanceListParams);

    return getInstancesPage(ec2, params, []);
}

const create = (ec2, imageId, name, size, count) => {
    console.log('Creating instances', {
        imageId,
        name,
        size,
        count
    });

    promisfy(ec2);

    const runParams = {
        ImageId: imageId,
        InstanceType: size,
        MinCount: count,
        MaxCount: count
    };

    // Create the instance
    return ec2.runInstancesAsync(runParams)
        .then((data) => {
            const instanceIds = _.map(data.Instances, 'InstanceId');

            // Add tags to the instance
            const tagParams = {
                Resources: instanceIds,
                Tags: [{
                    Key: 'Name',
                    Value: name
                }]
            };
            return ec2.createTagsAsync(tagParams);
        });
}

const stop = (ec2, instanceIds) => {
    console.log('Stopping instances', { instanceIds });

    promisfy(ec2);

    const params = {
        InstanceIds: instanceIds
    };

    return ec2.stopInstancesAsync(params);
}

const terminate = (ec2, instanceIds) => {
    console.log('Stopping instances', { instanceIds });

    promisfy(ec2);

    const params = {
        InstanceIds: instanceIds
    };

    return ec2.terminateInstancesAsync(params);
}


module.exports = {
    list,
    create,
    stop,
    terminate,
};
