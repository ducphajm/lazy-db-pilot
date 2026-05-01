import type {MongoCollectionDocument} from './mongodb/service.js';

export type LoadDatabases = (url: string) => Promise<string[]>;

export type LoadCollections = (
  url: string,
  databaseName: string,
) => Promise<string[]>;

export type LoadCollectionDocuments = (
  url: string,
  databaseName: string,
  collectionName: string,
  limit?: number,
) => Promise<MongoCollectionDocument[]>;
