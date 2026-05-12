import type {MongoCollectionDocument} from './mongodb/service.js';

export type LoadDatabases = (url: string) => Promise<string[]>;

export type LoadCollections = (
  url: string,
  databaseName: string,
) => Promise<string[]>;

export type CreateCollection = (
  url: string,
  databaseName: string,
  collectionName: string,
) => Promise<void>;

export type LoadCollectionDocuments = (
  url: string,
  databaseName: string,
  collectionName: string,
  limit?: number,
) => Promise<MongoCollectionDocument[]>;

export type InsertCollectionDocument = (
  url: string,
  databaseName: string,
  collectionName: string,
  document: MongoCollectionDocument,
) => Promise<void>;
