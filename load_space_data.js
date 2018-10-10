const Space = require('./space_model');
const mongoose = require('mongoose');

let spaceUsageDbConnection;

const loadSpaceUsageDbConnection = async () => {
  if (!spaceUsageDbConnection) {
    spaceUsageDbConnection
      = await mongoose.connect('mongodb://localhost:27018/space_usage_dev', { useNewUrlParser: true });
  }
};

const loadClientDataIntoTestDb = async () => {
  try {
    await loadSpaceUsageDbConnection();

    const savedSpaces = await Space.find({});
    if (savedSpaces.length) {
      await Space.collection.drop();
    }

    const spaces = [
      {
        _id: '0',
        name: 'Meeting room 1',
        occupancyCapacity: 10,
      },
      {
        _id: '5',
        name: 'Meeting room 2',
        occupancyCapacity: 8,
      },
      {
        _id: '6',
        name: 'Meeting room 2',
        occupancyCapacity: 8,
      },
    ];

    await Space.insertMany(spaces);

    await spaceUsageDbConnection.connection.close();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

loadClientDataIntoTestDb();

