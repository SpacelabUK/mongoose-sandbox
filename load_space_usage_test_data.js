const Client = require('./client_model');
const Space = require('./space_model');
const SpaceUsage = require('./space_usage_model');
const mongoose = require('mongoose');

let spaceUsageDbConnection;

const loadSpaceUsageDbConnection = async () => {
  if (!spaceUsageDbConnection) {
    spaceUsageDbConnection
      = await mongoose.connect('mongodb://localhost:27018/space_usage_dev', { useNewUrlParser: true });
  }
};

const ensureCollectionEmpty = async (model) => {
  const collectionRecords = await model.find({});
  if (collectionRecords.length) {
    await model.collection.drop();
  }
};

const generateSpacesTestData = (numberOfDeskSpaces, deskSpaceCategories) => {
  const spaces = [];

  for (let spaceNumber = 0; spaceNumber <= numberOfDeskSpaces; spaceNumber += 1) {
    const deskSpaceCategoryIndex
      = Math.floor((Math.random() * (deskSpaceCategories.length - 1)) + 0);
    const deskSpaceCategory = deskSpaceCategories[deskSpaceCategoryIndex];

    spaces.push({
      _id: spaceNumber.toString(),
      name: `${deskSpaceCategory} ${spaceNumber}`,
      category: deskSpaceCategory,
      occupancyCapacity: 5,
    });
  }

  return spaces;
};

const loadSpaceDataIntoTestDb = async () => {
  try {
    await ensureCollectionEmpty(Space);
    await ensureCollectionEmpty(SpaceUsage);

    const numberOfDeskSpaces = 50;
    const deskSpaceCategories = [
      'Fixed desks space',
      'Touchdown desks space',
      'Quiet desks space',
    ];
    const spaces = generateSpacesTestData(numberOfDeskSpaces, deskSpaceCategories);

    const numberOfSharedSpaces = 50;
    const sharedSpaceCategories = [
      'Meeting room',
      'Canteen',
      'Prayer room',
      'Gym',
      'Edit suites',
    ];
    spaces.push(generateSpacesTestData(numberOfSharedSpaces, sharedSpaceCategories));

    await Space.insertMany(spaces);

    const spaceIds = spaces.map(space => [space._id]);
    return spaceIds;
  } catch (error) {
    throw error;
  }
};

const loadSpaceUsageDataIntoTestDb = async () => {
  try {
    await ensureCollectionEmpty(SpaceUsage);
  } catch (error) {
    console.log(error);
  }
};

const loadClientDataIntoTestDb = async (spaceIds) => {
  try {
    await ensureCollectionEmpty(Client);

    const client = new Client({
      name: 'Accuware',
      sites: [
        {
          _id: '1001',
          name: 'Head office',
          floors: [
            { name: 'Ground floor', spaceIds },
          ],
        },
      ],
    });

    await client.save();
  } catch (error) {
    console.log(error);
  }
};

const loadDataIntoTestSpaceUsageDb = async () => {
  await loadSpaceUsageDbConnection();

  const spaceIds = await loadSpaceDataIntoTestDb();

  loadClientDataIntoTestDb(spaceIds);
};

loadDataIntoTestSpaceUsageDb();

