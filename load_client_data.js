const Client = require('./client_model');
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

    const clients = await Client.find({});

    const client = new Client({
      name: 'Accuware',
      sites: [
        {
          _id: '1001',
          name: 'Head office',
          floors: [
            { name: 'Ground floor', spaceIds: ['0', '5', '6'] },
          ],
        },
      ],
    });

    await client.save();
  } catch (error) {
    console.log(error);
  }
};

loadClientDataIntoTestDb();

