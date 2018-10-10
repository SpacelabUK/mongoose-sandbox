const SpaceUsage = require('./space_usage_model');
const mongoose = require('mongoose');

let spaceUsageDbConnection;

const loadSpaceUsageDbConnection = async () => {
  if (!spaceUsageDbConnection) {
    spaceUsageDbConnection
      = await mongoose.connect('mongodb://localhost:27018/space_usage_dev', { useNewUrlParser: true });
  }
};

const querySpaceUsageData = async () => {
  try {
    await loadSpaceUsageDbConnection();

    const savedSpaceUsages = await SpaceUsage.find({});

    await spaceUsageDbConnection.connection.close();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

querySpaceUsageData();

