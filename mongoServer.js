const path = require('path');
const propertiesReader = require('properties-reader'); 
const propertiesPath = path.resolve(__dirname, './conf/db.properties');
const properties = propertiesReader(propertiesPath);
const {MongoClient, ServerApiVersion} = require('mongodb');


// Create connection URI with encoded root and password
let dbPprefix = properties.get('db.prefix');
let dbUsername = encodeURIComponent(properties.get('db.user'));
let dbPwd = encodeURIComponent(properties.get('db.pwd'));
let dbName = properties.get('db.dbName');
let dbUrl = properties.get('db.dbUrl');
let dbParams = properties.get('db.params');
const URI = dbPprefix + dbUsername + ':' + dbPwd + dbUrl + dbParams;

// Set up client
const CLIENT = new MongoClient(URI, {serverApi: ServerApiVersion.v1});
// The database that will be used within mongoDB
const DB = CLIENT.db(dbName);

// Function to test the connection with the database
async function testConnection() {
  try {
      await CLIENT.connect();
      console.log('Connected to MongoDB.');
  } catch (error) {
      console.log(`Failed to connect to MongoDB ${error}`);
  }
}
testConnection();

// The collections that will be used
const USER = DB.collection("User");
const EDUCATION = DB.collection("Education");
const LINKS = DB.collection("Links");
const PROJECTS = DB.collection("Projects");
const SKILLS = DB.collection("Skills");

// Exporting the collections 
module.exports = { USER, EDUCATION, LINKS, PROJECTS, SKILLS };