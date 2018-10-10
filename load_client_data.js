const Client = require('./client_model');
const mongoose = require('mongoose');

let spaceUsageDbConnection;

const loadSpaceUsageDbConnection = async () => {
  if (!spaceUsageDbConnection) {
    spaceUsageDbConnection
      = await mongoose.connect('mongodb://heroku_nxtd4jt2:412afiji2ms0595rldr2nbs9i3@ds155352.mlab.com:55352/heroku_nxtd4jt2', { useNewUrlParser: true });
  }
};

const loadClientDataIntoTestDb = async () => {
  try {
    await loadSpaceUsageDbConnection();

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

