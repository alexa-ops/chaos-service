'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

const promisfy = (obj) => BbPromise.promisifyAll(obj);

const getInstanceListParams = (state) => {
    const params = {
        Filters: []
    };

    if (state) {
        params.Filters.push({
            Name: 'instance-state-name',
            Values: [
                state,
            ]
        });
    }

    return state;
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
                const nextParams = _.assign({
                    NextToken: result.NextToken,
                }, params);

                return getInstancesPage(ec2, nextParams, instances)
            }

            return instances;
        });
};

const list = (ec2, state) => {
    promisfy(ec2);

    const params = getInstanceListParams(state);

    return getInstancesPage(ec2, params, []);
}

const getCountBySelector = (selector) => {
    switch(selector) {
        case 'az':
        case 'availability-zone':
            return (i) => (i.Placement.AvailabilityZone)
        case 'name':
            return (i) => {
                console.log('Tags', i.Tags);
                const nameTag = _.find(i.Tags, { 'Key': 'Name' });
                return nameTag ? nameTag.Value : '';
            }
        case 'size':
            return (i) => (i.InstanceType)
        case 'state':
        default:
            return (i) => (i.State.Name);
    }
}

const countBy = (ec2, selector) => {
    const selectorFunc = getCountBySelector(selector);

    return list(ec2).then((instances) => {
        if(!instances.length) {
            return { total: 0 };
        }

        const grouped = _.groupBy(instances, selectorFunc);
        console.log('Grouped ', grouped);

        return _.reduce(grouped, (accum, value, key) => {
            accum[key] = value.length;
            return accum;
        }, {
            total: instances.length
        });
    });
};

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
    console.log('Stopping instances', {
        instanceIds
    });

    promisfy(ec2);

    const params = {
        InstanceIds: instanceIds
    };

    return ec2.stopInstancesAsync(params);
}

const terminate = (ec2, instanceIds) => {
    console.log('Stopping instances', {
        instanceIds
    });

    promisfy(ec2);

    const params = {
        InstanceIds: instanceIds
    };

    return ec2.terminateInstancesAsync(params);
}


module.exports = {
    countBy,
    list,
    create,
    stop,
    terminate,
};
