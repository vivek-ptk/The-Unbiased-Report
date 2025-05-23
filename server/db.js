import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME);
  }
  return db;
}

export default connectToDB;
