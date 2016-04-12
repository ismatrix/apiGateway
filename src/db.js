const MongoClient = require('mongodb').MongoClient;

let connectionInstance;

export const Mongodb = (url) => {
  this.url = url;
};

Mongodb.prototype.connect = async () => {
  if (connectionInstance) return connectionInstance;
  try {
    connectionInstance = await MongoClient.connect(this.url);
    return connectionInstance;
  } catch (err) {
    return err;
  }
};
