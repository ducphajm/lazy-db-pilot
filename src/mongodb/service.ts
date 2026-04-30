import {MongoClient} from 'mongodb';
import {MongoOperation, MongoServiceError} from './errors.js';

export type MongoDatabaseInfo = {
  readonly name: string;
};

export type MongoCollectionInfo = {
  readonly collectionName: string;
};

export type MongoAdminLike = {
  listDatabases: () => Promise<{
    readonly databases: readonly MongoDatabaseInfo[];
  }>;
};

export type MongoDbLike = {
  admin: () => MongoAdminLike;
  collections: () => Promise<readonly MongoCollectionInfo[]>;
};

export type MongoClientLike = {
  connect: () => Promise<unknown>;
  db: (databaseName?: string) => MongoDbLike;
  close: () => Promise<void>;
};

export type MongoClientFactory = (url: string) => MongoClientLike;

const createMongoClient: MongoClientFactory = (url: string) =>
  new MongoClient(url, {serverSelectionTimeoutMS: 5000});

export async function listMongoDatabases(
  url: string,
  createClient: MongoClientFactory = createMongoClient,
): Promise<string[]> {
  const client = createClient(url);

  try {
    await client.connect();
    const result = await client.db().admin().listDatabases();

    return result.databases.map(database => database.name);
  } catch (error: unknown) {
    throw new MongoServiceError(MongoOperation.ListDatabases, error);
  } finally {
    await client.close();
  }
}

export async function listMongoCollections(
  url: string,
  databaseName: string,
  createClient: MongoClientFactory = createMongoClient,
): Promise<string[]> {
  const client = createClient(url);

  try {
    await client.connect();
    const collections = await client.db(databaseName).collections();

    return collections.map(collection => collection.collectionName);
  } catch (error: unknown) {
    throw new MongoServiceError(MongoOperation.ListCollections, error);
  } finally {
    await client.close();
  }
}
