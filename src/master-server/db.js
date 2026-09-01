import { MongoClient } from 'mongodb';

let client;
let database;

export async function connectDatabase() {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  client = new MongoClient(uri, { maxPoolSize: 20 });
  await client.connect();
  database = client.db(process.env.MONGODB_DB || 'blobrush');
  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database.collection('users').createIndex({ 'providers.provider': 1, 'providers.subject': 1 }, { sparse: true });
  return database;
}

export const db = () => {
  if (!database) throw new Error('Database is not connected');
  return database;
};

export async function closeDatabase() {
  await client?.close();
}
