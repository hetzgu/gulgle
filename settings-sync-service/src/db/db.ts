import mongoDB from "mongodb";
import { Lock } from "../utils";

export async function getDb(): Promise<mongoDB.Db> {
  return (await getConnection()).db("settings-sync");
}

export async function executeQuery<T>(collection: string, query: (db: mongoDB.Collection) => Promise<T>): Promise<T> {
  const db = await getDb();
  return query(db.collection(collection));
}

const mutex = new Lock();
let client: mongoDB.MongoClient | undefined;
export async function getConnection(): Promise<mongoDB.MongoClient> {
  await mutex.tryLockAsync();

  if (!client) {
    const newClient = new mongoDB.MongoClient("mongodb://root:pass@localhost:27017");
    await newClient.connect();
    client = newClient;
  }

  mutex.unlock();
  return client;
}
