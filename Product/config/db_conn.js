const mongoose = require('mongoose');
const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient();

const mongo_username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;
const mongo_cluster = process.env.MONGO_CLUSTER;
const mongo_database = process.env.MONGO_DBNAME;

mongoose.connect(
  `mongodb+srv://${mongo_username}:${mongo_password}@${mongo_cluster}/${mongo_database}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
    console.log(`Connected to: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error("========== MongoDB Connection Error ==========");
    console.error(err);
    console.error(err.stack);
    console.error("=============================================");
});

module.exports = mongoose;