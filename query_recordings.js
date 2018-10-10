const Recording = require('./recording.js');
const mongoose = require('mongoose');

let RecordingDbConnection;

const loadRecordingDbConnection = async () => {
  if (!RecordingDbConnection) {
    RecordingDbConnection
      = await mongoose.connect('mongodb://localhost:27017/space_usage_dev', { useNewUrlParser: true });
  }
};

const queryRecordingData = async () => {
  try {
    await loadRecordingDbConnection();

    const savedRecordings = await Recording.find({});

    await RecordingDbConnection.connection.close();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

queryRecordingData();

