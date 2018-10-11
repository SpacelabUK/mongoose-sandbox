const mongoose = require('mongoose');
const Client = require('./client_model');
const Space = require('./space_model');
const SpaceUsage = require('./space_usage_model');

let spaceUsageDbConnection;

const loadSpaceUsageDbConnection = async () => {
  if (!spaceUsageDbConnection) {
    spaceUsageDbConnection = await mongoose.connect('mongodb://localhost:27018/space_usage_dev', { useNewUrlParser: true });
  }
};

const ensureCollectionEmpty = async (model) => {
  const collectionRecords = await model.find({});
  if (collectionRecords.length) {
    await model.collection.drop();
  }
};

const generateTestSpaces = (startingSpaceNumber, numberOfDeskSpaces, deskSpaceCategories) => {
  const spaces = [];

  for (
    let spaceNumber = startingSpaceNumber;
    spaceNumber < (numberOfDeskSpaces + startingSpaceNumber);
    spaceNumber += 1
  ) {
    const deskSpaceCategoryIndex = Math.floor(
      (Math.random() * (deskSpaceCategories.length - 1)) + 0,
    );
    const deskSpaceCategory = deskSpaceCategories[deskSpaceCategoryIndex];

    spaces.push({
      _id: spaceNumber.toString(),
      name: `${deskSpaceCategory} ${spaceNumber}`,
      category: deskSpaceCategory,
      occupancyCapacity: 10,
    });
  }

  return spaces;
};

const generateDeskSpaces = () => {
  const numberOfDeskSpaces = 50;
  const deskSpaceCategories = [
    'Fixed desks space',
    'Touchdown desks space',
    'Quiet desks space',
  ];
  const startingSpaceNumber = 0;

  return generateTestSpaces(startingSpaceNumber, numberOfDeskSpaces, deskSpaceCategories);
};

const generateSharedSpaces = (startingSpaceNumber) => {
  const numberOfSharedSpaces = 50;
  const sharedSpaceCategories = [
    'Meeting room',
    'Canteen',
    'Prayer room',
    'Gym',
    'Edit suites',
  ];

  return generateTestSpaces(startingSpaceNumber, numberOfSharedSpaces, sharedSpaceCategories);
};

const generateSpacesInTestDb = async () => {
  try {
    await ensureCollectionEmpty(Space);

    let startingSpaceNumber = 0;
    const deskSpaces = generateDeskSpaces(startingSpaceNumber);

    startingSpaceNumber = 50;
    const sharedSpaces = generateSharedSpaces(startingSpaceNumber);

    const spaces = deskSpaces.concat(sharedSpaces);

    await Space.insertMany(spaces);

    const spaceIds = spaces.map(space => [space._id]);
    return { spaces, spaceIds };
  } catch (error) {
    throw error;
  }
};

const generateTestSpaceUsages = (spaces) => {
  const spaceUsages = [];

  const numberOfHours = 24;
  const numberOfPeriodsPerHour = 4;
  const startOfPeriod = new Date('April 10, 2018 00:00:00').getTime();

  const numberOfPeopleRecordedByHour = {
    8: 1,
    9: 4,
    10: 6,
    11: 7,
    12: 5,
    13: 2,
    14: 8,
    15: 9,
    16: 7,
    17: 5,
    18: 3,
  };

  for (const space of spaces) {
    for (
      let hourNumber = 1;
      hourNumber <= numberOfHours;
      hourNumber += 1
    ) {
      let numberOfPeopleRecorded = numberOfPeopleRecordedByHour[hourNumber];
      if (!numberOfPeopleRecorded) {
        numberOfPeopleRecorded = 0;
      }
      for (
        let spaceUsagePeriodNumber = 1;
        spaceUsagePeriodNumber <= numberOfPeriodsPerHour;
        spaceUsagePeriodNumber += 1
      ) {
        spaceUsages.push({
          spaceId: space._id,
          usagePeriodStartTime: startOfPeriod + ((hourNumber - 1) * 60 * 60 * 1000) + ((spaceUsagePeriodNumber - 1) * 15 * 60 * 1000),
          usagePeriodEndTime: startOfPeriod + ((hourNumber - 1) * 60 * 60 * 1000) + (spaceUsagePeriodNumber * 15 * 60 * 1000),
          numberOfPeopleRecorded,
          occupancy: numberOfPeopleRecorded / space.occupancyCapacity,
        });
      }
    }
  }

  return spaceUsages;
};

const generateSpaceUsagesInTestDb = async (spaces) => {
  try {
    await ensureCollectionEmpty(SpaceUsage);

    const spaceUsages = generateTestSpaceUsages(spaces);

    await SpaceUsage.insertMany(spaceUsages);
  } catch (error) {
    console.log(error);
  }
};

const generateClientInTestDb = async (spaceIds) => {
  try {
    await ensureCollectionEmpty(Client);

    const client = new Client({
      name: 'Best Client Ltd.',
      sites: [
        {
          _id: '1',
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

  const { spaces, spaceIds } = await generateSpacesInTestDb();

  await generateSpaceUsagesInTestDb(spaces);

  await generateClientInTestDb(spaceIds);

  await spaceUsageDbConnection.connection.close();
  process.exit();
};

loadDataIntoTestSpaceUsageDb();
