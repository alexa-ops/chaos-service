'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

const promisfy = (obj) => BbPromise.promisifyAll(obj);

const getInstancesPage = (ec2, params, currentInstances) => {
  return ec2
      .describeInstancesAsync(params)
      .then(result => {
        const instances = _.concat(currentInstances, result.Instances);

        if(result.NextToken) {
          const params = {
            MaxResults: 0,
            NextToken: result.NextToken,
          };

          return getInstancesPage(ec2, params, instances)
        }

        return instances;
      });
};

const list = (ec2) => {
  promisfy(ec2);

  const params = {
    Filters: [],
    MaxResults: 0,
  };

  return getInstancesPage(ec2, params, []);
}
//
// const create = (ec2, imageId, name, size, count) => {
//   promisfy(ec2);
//
//   const runParams = {
//     ImageId: imageId,
//     InstanceType: size,
//     MinCount: count, MaxCount: count
//   };
//
//   // Create the instance
//   return ec2.runInstancesAsync(runParams)
//     .then((data) => {
//       const instanceIds = _.map(data.Instances, 'InstanceId');
//
//       // Add tags to the instance
//       const tagParams = {
//         Resources: instanceIds,
//         Tags: [
//           { Key: 'Name', Value: name }
//         ]
//       };
//       return ec2.createTagsAsync(tagParams);
//     });
// }

const stop = (ec2, instanceIds) => {
  promisfy(ec2);

  const params = {
    InstanceIds: instanceIds
  };

  return ec2.stopInstancesAsync(params);
}

const terminate = (ec2, instanceIds) => {
  promisfy(ec2);

  const params = {
    InstanceIds: instanceIds
  };

  return ec2.terminateInstancesAsync(params);
}


module.exports = {
  list: list,
  // create: create,
  stop: stop,
  terminate: terminate,
};
