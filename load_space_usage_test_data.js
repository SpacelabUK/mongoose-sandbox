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

const generateTestSpaces = (numberOfDeskSpaces, deskSpaceCategories) => {
  const spaces = [];

  for (let spaceNumber = 0; spaceNumber < numberOfDeskSpaces; spaceNumber += 1) {
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

const loadSpacesIntoTestDb = async () => {
  try {
    await ensureCollectionEmpty(Space);
    await ensureCollectionEmpty(SpaceUsage);

    const numberOfDeskSpaces = 50;
    const deskSpaceCategories = [
      'Fixed desks space',
      'Touchdown desks space',
      'Quiet desks space',
    ];
    const deskSpaces = generateTestSpaces(numberOfDeskSpaces, deskSpaceCategories);

    const numberOfSharedSpaces = 50;
    const sharedSpaceCategories = [
      'Meeting room',
      'Canteen',
      'Prayer room',
      'Gym',
      'Edit suites',
    ];
    const spaces
      = deskSpaces.concat(generateTestSpaces(numberOfSharedSpaces, sharedSpaceCategories));

    await Space.insertMany(spaces);

    const spaceIds = spaces.map(space => [space._id]);
    return { spaces, spaceIds };
  } catch (error) {
    throw error;
  }
};

const generateTestSpaceUsages = (spaces) => {
  const spaceUsages = [];

  const numberOfSpaceUsagePeriods = 180 * 24 * 4;
  const startOfPeriod = new Date('April 10, 2018 00:00:00').getTime();

  for (const space of spaces) {
    for (
      let spaceUsagePeriodNumber = 1;
      spaceUsagePeriodNumber <= numberOfSpaceUsagePeriods;
      spaceUsagePeriodNumber += 1
    ) {
      const numberOfPeopleRecorded = Math.floor((Math.random() * (space.occupancyCapacity)) + 0);

      spaceUsages.push({
        spaceId: space._id,
        usagePeriodStartTime: startOfPeriod + ((spaceUsagePeriodNumber - 1) * (15 * 60 * 60)),
        usagePeriodEndTime: startOfPeriod + (spaceUsagePeriodNumber * (15 * 60 * 60)),
        numberOfPeopleRecorded,
        occupancy: numberOfPeopleRecorded / space.occupancyCapacity,
      });
    }
  }

  return spaceUsages;
};

const loadSpaceUsagesIntoTestDb = async (spaces) => {
  try {
    await ensureCollectionEmpty(SpaceUsage);

    const spaceUsages = generateTestSpaceUsages(spaces);

    await SpaceUsage.insertMany(spaceUsages);
  } catch (error) {
    console.log(error);
  }
};

const loadClientIntoTestDb = async (spaceIds) => {
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

  const { spaces, spaceIds } = await loadSpacesIntoTestDb();

  loadClientIntoTestDb(spaceIds);

  await loadSpaceUsagesIntoTestDb(spaces);
};

loadDataIntoTestSpaceUsageDb();

