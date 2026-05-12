import {MongoClient, type Document} from 'mongodb';
import {MongoOperation, MongoServiceError} from './errors.js';

export const DEFAULT_COLLECTION_DOCUMENT_LIMIT = 25;

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
  collection: (collectionName: string) => MongoCollectionLike;
  collections: () => Promise<readonly MongoCollectionInfo[]>;
  createCollection: (collectionName: string) => Promise<unknown>;
};

export type MongoCollectionDocument = Record<string, unknown>;

export type MongoCollectionLike = {
  find: (
    filter: Document,
    options: {readonly limit: number},
  ) => MongoFindCursorLike;
  insertOne: (document: Document) => Promise<unknown>;
};

export type MongoFindCursorLike = {
  toArray: () => Promise<readonly MongoCollectionDocument[]>;
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

export async function loadMongoCollectionDocuments(
  url: string,
  databaseName: string,
  collectionName: string,
  limit: number = DEFAULT_COLLECTION_DOCUMENT_LIMIT,
  createClient: MongoClientFactory = createMongoClient,
): Promise<MongoCollectionDocument[]> {
  const client = createClient(url);

  try {
    await client.connect();
    const documents = await client
      .db(databaseName)
      .collection(collectionName)
      .find({}, {limit})
      .toArray();

    return [...documents];
  } catch (error: unknown) {
    throw new MongoServiceError(MongoOperation.LoadCollectionDocuments, error);
  } finally {
    await client.close();
  }
}

export async function insertMongoCollectionDocument(
  url: string,
  databaseName: string,
  collectionName: string,
  document: MongoCollectionDocument,
  createClient: MongoClientFactory = createMongoClient,
): Promise<void> {
  const client = createClient(url);

  try {
    await client.connect();
    await client.db(databaseName).collection(collectionName).insertOne(document);
  } catch (error: unknown) {
    throw new MongoServiceError(MongoOperation.InsertDocument, error);
  } finally {
    await client.close();
  }
}

export async function createMongoCollection(
  url: string,
  databaseName: string,
  collectionName: string,
  createClient: MongoClientFactory = createMongoClient,
): Promise<void> {
  const client = createClient(url);

  try {
    await client.connect();
    await client.db(databaseName).createCollection(collectionName);
  } catch (error: unknown) {
    throw new MongoServiceError(MongoOperation.CreateCollection, error);
  } finally {
    await client.close();
  }
}
