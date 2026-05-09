import {addConnection, deleteConnection} from '../connections/persistence.js';
import type {ConnectionInput, DatabaseConnection} from '../connections/types.js';
import {
  loadMongoCollectionDocuments,
  insertMongoCollectionDocument,
  listMongoCollections,
  listMongoDatabases,
} from '../mongodb/service.js';
import type {
  InsertCollectionDocument,
  LoadCollectionDocuments,
  LoadCollections,
  LoadDatabases,
} from '../types.js';
import type {DeleteConnection} from './useConnectionDeletion.js';

export type SaveConnection = (
  input: ConnectionInput,
) => Promise<DatabaseConnection[]>;

export const defaultLoadDatabases: LoadDatabases = url =>
  listMongoDatabases(url);

export const defaultLoadCollections: LoadCollections = (url, databaseName) =>
  listMongoCollections(url, databaseName);

export const defaultLoadCollectionDocuments: LoadCollectionDocuments = (
  url,
  databaseName,
  collectionName,
  limit,
) => loadMongoCollectionDocuments(url, databaseName, collectionName, limit);

export const defaultInsertCollectionDocument: InsertCollectionDocument = (
  url,
  databaseName,
  collectionName,
  document,
) => insertMongoCollectionDocument(url, databaseName, collectionName, document);

export const defaultSaveConnection: SaveConnection = input =>
  addConnection(input);

export const defaultDeleteConnection: DeleteConnection = name =>
  deleteConnection(name);
