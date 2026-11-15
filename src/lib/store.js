// Task storage in MongoDB.
//
// Set MONGODB_URI (and optionally MONGODB_DB, default "todo"). On Vercel, the
// MongoDB Atlas integration from the Marketplace sets MONGODB_URI for you.
// Each task is one document in the "tasks" collection, tagged with the
// visitor's anonymous uid so people only ever see their own tasks.

import { MongoClient } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "todo";

// Reuse one connection across hot reloads in dev and across invocations of a
// warm serverless function in production.
const cache = (globalThis.__todoMongo ??= { promise: null });

function tasksCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (or your Vercel project settings).");

  cache.promise ??= (async () => {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    const tasks = client.db(DB_NAME).collection("tasks");
    await tasks.createIndex({ uid: 1, date: 1, startTime: 1 });
    return tasks;
  })().catch((err) => {
    cache.promise = null; // let the next request retry
    throw err;
  });

  return cache.promise;
}

const toTask = ({ _id, uid, ...rest }) => ({ id: _id, ...rest });
const toDoc = (uid, { id, ...rest }) => ({ _id: id, uid, ...rest });
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listTasks(uid, query = "") {
  const filter = { uid };
  const q = query.trim();
  if (q) {
    const match = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: match }, { description: match }];
  }
  const docs = await (await tasksCollection())
    .find(filter)
    .sort({ date: 1, startTime: 1, createdAt: 1 })
    .toArray();
  return docs.map(toTask);
}

export async function getTask(uid, id) {
  const doc = await (await tasksCollection()).findOne({ _id: id, uid });
  return doc ? toTask(doc) : null;
}

export async function saveTask(uid, task) {
  await (await tasksCollection()).replaceOne({ _id: task.id, uid }, toDoc(uid, task), { upsert: true });
}

export async function saveTasks(uid, tasks) {
  if (!tasks.length) return;
  await (await tasksCollection()).insertMany(tasks.map((task) => toDoc(uid, task)));
}

export async function deleteTask(uid, id) {
  const { deletedCount } = await (await tasksCollection()).deleteOne({ _id: id, uid });
  return deletedCount > 0;
}
