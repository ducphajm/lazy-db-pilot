import type {DatabaseConnection} from '../connections/types.js';
import type {SaveConnection} from './defaultOperations.js';
import type {DeleteConnection} from './useConnectionDeletion.js';
import type {
  InsertCollectionDocument,
  LoadCollectionDocuments,
  LoadCollections,
  LoadDatabases,
} from '../types.js';

export type AppProps = {
  readonly deleteConnectionByName?: DeleteConnection;
  readonly insertCollectionDocument?: InsertCollectionDocument;
  readonly loadCollectionDocuments?: LoadCollectionDocuments;
  readonly loadCollections?: LoadCollections;
  readonly loadConnectionsList?: () => Promise<DatabaseConnection[]>;
  readonly loadDatabases?: LoadDatabases;
  readonly onExit?: () => void;
  readonly saveConnection?: SaveConnection;
};
