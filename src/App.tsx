import {useApp, useInput} from 'ink';
import {useCallback, useEffect, useState} from 'react';
import {addConnection, loadConnections} from './connections/persistence.js';
import {
  ConnectionEnvironment,
  DatabaseType,
  type ConnectionInput,
  type DatabaseConnection,
} from './connections/types.js';
import {MongoOperation, MongoValidationError} from './mongodb/errors.js';
import {
  loadMongoCollectionDocuments,
  listMongoCollections,
  listMongoDatabases,
  type MongoCollectionDocument,
} from './mongodb/service.js';
import {validateMongoUrl} from './mongodb/validation.js';
import {AppView} from './app/AppView.js';
import {getConnectionErrorMessage, getDisplayError} from './app/errors.js';
import {AppPhase} from './app/phases.js';
import {RecoveryAction} from './app/ui.js';
import type {
  LoadCollectionDocuments,
  LoadCollections,
  LoadDatabases,
} from './types.js';

type SaveConnection = (input: ConnectionInput) => Promise<DatabaseConnection[]>;

type AppProps = {
  readonly loadCollectionDocuments?: LoadCollectionDocuments;
  readonly loadCollections?: LoadCollections;
  readonly loadConnectionsList?: () => Promise<DatabaseConnection[]>;
  readonly loadDatabases?: LoadDatabases;
  readonly onExit?: () => void;
  readonly saveConnection?: SaveConnection;
};

type ConnectionDraft = {
  readonly name: string;
  readonly type: DatabaseType | null;
  readonly environment: ConnectionEnvironment | null;
};

const defaultLoadDatabases: LoadDatabases = url => listMongoDatabases(url);
const defaultLoadCollections: LoadCollections = (url, databaseName) =>
  listMongoCollections(url, databaseName);
const defaultLoadCollectionDocuments: LoadCollectionDocuments = (
  url,
  databaseName,
  collectionName,
  limit,
) => loadMongoCollectionDocuments(url, databaseName, collectionName, limit);
const defaultSaveConnection: SaveConnection = input => addConnection(input);

export function App({
  loadCollectionDocuments = defaultLoadCollectionDocuments,
  loadCollections = defaultLoadCollections,
  loadConnectionsList = loadConnections,
  loadDatabases = defaultLoadDatabases,
  onExit,
  saveConnection = defaultSaveConnection,
}: AppProps): React.JSX.Element {
  const {exit} = useApp();
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LoadingConnections);
  const [inputKey, setInputKey] = useState(0);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] =
    useState<DatabaseConnection | null>(null);
  const [draft, setDraft] = useState<ConnectionDraft>({
    name: '',
    type: null,
    environment: null,
  });
  const [pendingConnection, setPendingConnection] =
    useState<ConnectionInput | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [collectionDocuments, setCollectionDocuments] =
    useState<MongoCollectionDocument[]>([]);
  const exitApp = onExit ?? exit;

  const resetCreation = useCallback((message: string | null = null) => {
    setDraft({name: '', type: null, environment: null});
    setPendingConnection(null);
    setInputError(message);
    setInputKey(key => key + 1);
    setPhase(AppPhase.CreatingName);
  }, []);

  const showConnectionList = useCallback(() => {
    setOperationError(null);
    setSelectedConnection(null);
    setSelectedDatabase(null);
    setSelectedCollection(null);
    setCollections([]);
    setCollectionDocuments([]);
    setDatabases([]);
    setPhase(
      connections.length > 0
        ? AppPhase.ConnectionsLoaded
        : AppPhase.CreatingName,
    );
  }, [connections.length]);

  const submitConnectionName = useCallback((input: string) => {
    const name = input.trim();

    if (name.length === 0) {
      setInputError('Connection name is required.');
      setInputKey(key => key + 1);
      return;
    }

    if (connections.some(connection => connection.name === name)) {
      setInputError('Connection name must be unique.');
      setInputKey(key => key + 1);
      return;
    }

    setDraft({name, type: null, environment: null});
    setInputError(null);
    setPhase(AppPhase.CreatingType);
  }, [connections]);

  const submitDatabaseType = useCallback((type: DatabaseType) => {
    setDraft(current => ({...current, type}));
    setInputError(null);
    setPhase(AppPhase.CreatingEnvironment);
  }, []);

  const submitEnvironment = useCallback((environment: ConnectionEnvironment) => {
    setDraft(current => {
      const nextDraft = {...current, environment};

      if (nextDraft.type === null) {
        return nextDraft;
      }

      if (nextDraft.type === DatabaseType.MongoDB) {
        setPhase(AppPhase.CreatingMongoUrl);
      } else {
        setPendingConnection({
          name: nextDraft.name,
          type: nextDraft.type,
          environment,
          details: {},
        });
        setPhase(AppPhase.SavingConnection);
      }

      return nextDraft;
    });
  }, []);

  const submitMongoUrl = useCallback((input: string) => {
    if (draft.type !== DatabaseType.MongoDB || draft.environment === null) {
      setInputError('Connection details are incomplete.');
      return;
    }

    try {
      setPendingConnection({
        name: draft.name,
        type: DatabaseType.MongoDB,
        environment: draft.environment,
        details: {url: validateMongoUrl(input)},
      });
      setInputError(null);
      setPhase(AppPhase.SavingConnection);
    } catch (error: unknown) {
      if (error instanceof MongoValidationError) {
        setInputError(error.message);
      } else {
        setInputError('Invalid MongoDB URL.');
      }

      setInputKey(key => key + 1);
    }
  }, [draft]);

  const selectConnection = useCallback((connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setOperationError(null);
    setDatabases([]);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setSelectedDatabase(null);

    if (connection.type !== DatabaseType.MongoDB) {
      setPhase(AppPhase.UnsupportedConnection);
      return;
    }

    setPhase(AppPhase.LoadingDatabases);
  }, []);

  const selectDatabase = useCallback((databaseName: string) => {
    setSelectedDatabase(databaseName);
    setOperationError(null);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setPhase(AppPhase.LoadingCollections);
  }, []);

  const selectCollection = useCallback((collectionName: string) => {
    setSelectedCollection(collectionName);
    setCollectionDocuments([]);
    setOperationError(null);
    setPhase(AppPhase.LoadingCollectionData);
  }, []);

  const returnToDatabases = useCallback(() => {
    setOperationError(null);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setPhase(AppPhase.DatabasesLoaded);
  }, []);

  const returnToCollections = useCallback(() => {
    setOperationError(null);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setPhase(
      collections.length > 0
        ? AppPhase.CollectionsLoaded
        : AppPhase.CollectionsEmpty,
    );
  }, [collections.length]);

  const handleRecovery = useCallback((action: RecoveryAction) => {
    if (action === RecoveryAction.CreateConnection) {
      resetCreation();
      return;
    }

    showConnectionList();
  }, [resetCreation, showConnectionList]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exitApp();
      return;
    }

    if (input === 'q' && phase !== AppPhase.CreatingName) {
      exitApp();
      return;
    }

    if (
      input === 'h' &&
      (phase === AppPhase.CollectionsLoaded ||
        phase === AppPhase.CollectionsEmpty)
    ) {
      returnToDatabases();
    }

    if (
      input === 'h' &&
      (phase === AppPhase.CollectionDataLoaded ||
        phase === AppPhase.CollectionDataEmpty ||
        phase === AppPhase.CollectionDataError)
    ) {
      returnToCollections();
    }
  });

  useEffect(() => {
    if (phase !== AppPhase.LoadingConnections) {
      return;
    }

    let isActive = true;

    void loadConnectionsList()
      .then(nextConnections => {
        if (!isActive) {
          return;
        }

        setConnections(nextConnections);
        setPhase(
          nextConnections.length > 0
            ? AppPhase.ConnectionsLoaded
            : AppPhase.CreatingName,
        );
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setOperationError('Unable to load saved connections.');
        setPhase(AppPhase.ConnectionsError);
      });

    return () => {
      isActive = false;
    };
  }, [loadConnectionsList, phase]);

  useEffect(() => {
    if (phase !== AppPhase.SavingConnection || pendingConnection === null) {
      return;
    }

    let isActive = true;

    void saveConnection(pendingConnection)
      .then(nextConnections => {
        if (!isActive) {
          return;
        }

        setConnections(nextConnections);
        setPendingConnection(null);
        setDraft({name: '', type: null, environment: null});
        setPhase(AppPhase.ConnectionsLoaded);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setPendingConnection(null);
        setInputError(getConnectionErrorMessage(error));
        setInputKey(key => key + 1);
        setPhase(AppPhase.CreatingName);
      });

    return () => {
      isActive = false;
    };
  }, [pendingConnection, phase, saveConnection]);

  useEffect(() => {
    if (
      phase !== AppPhase.LoadingDatabases ||
      selectedConnection?.type !== DatabaseType.MongoDB
    ) {
      return;
    }

    let isActive = true;

    void loadDatabases(selectedConnection.details.url)
      .then(nextDatabases => {
        if (!isActive) {
          return;
        }

        setDatabases(nextDatabases);
        setPhase(
          nextDatabases.length > 0
            ? AppPhase.DatabasesLoaded
            : AppPhase.DatabasesEmpty,
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setOperationError(getDisplayError(error, MongoOperation.ListDatabases));
        setPhase(AppPhase.DatabaseError);
      });

    return () => {
      isActive = false;
    };
  }, [loadDatabases, phase, selectedConnection]);

  useEffect(() => {
    if (
      phase !== AppPhase.LoadingCollections ||
      selectedConnection?.type !== DatabaseType.MongoDB ||
      selectedDatabase === null
    ) {
      return;
    }

    let isActive = true;

    void loadCollections(selectedConnection.details.url, selectedDatabase)
      .then(nextCollections => {
        if (!isActive) {
          return;
        }

        setCollections(nextCollections);
        setSelectedCollection(null);
        setCollectionDocuments([]);
        setPhase(
          nextCollections.length > 0
            ? AppPhase.CollectionsLoaded
            : AppPhase.CollectionsEmpty,
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setOperationError(
          getDisplayError(error, MongoOperation.ListCollections),
        );
        setPhase(AppPhase.CollectionError);
      });

    return () => {
      isActive = false;
    };
  }, [loadCollections, phase, selectedConnection, selectedDatabase]);

  useEffect(() => {
    if (
      phase !== AppPhase.LoadingCollectionData ||
      selectedConnection?.type !== DatabaseType.MongoDB ||
      selectedDatabase === null ||
      selectedCollection === null
    ) {
      return;
    }

    let isActive = true;

    void loadCollectionDocuments(
      selectedConnection.details.url,
      selectedDatabase,
      selectedCollection,
    )
      .then(nextDocuments => {
        if (!isActive) {
          return;
        }

        setCollectionDocuments(nextDocuments);
        setPhase(
          nextDocuments.length > 0
            ? AppPhase.CollectionDataLoaded
            : AppPhase.CollectionDataEmpty,
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setOperationError(
          getDisplayError(error, MongoOperation.LoadCollectionDocuments),
        );
        setPhase(AppPhase.CollectionDataError);
      });

    return () => {
      isActive = false;
    };
  }, [
    loadCollectionDocuments,
    phase,
    selectedCollection,
    selectedConnection,
    selectedDatabase,
  ]);

  return (
    <AppView
      collectionDocuments={collectionDocuments}
      collections={collections}
      connections={connections}
      databases={databases}
      inputError={inputError}
      inputKey={inputKey}
      onCreateConnection={() => resetCreation()}
      onRecovery={handleRecovery}
      onSelectConnection={selectConnection}
      onSelectCollection={selectCollection}
      onSelectDatabase={selectDatabase}
      onSubmitConnectionName={submitConnectionName}
      onSubmitDatabaseType={submitDatabaseType}
      onSubmitEnvironment={submitEnvironment}
      onSubmitMongoUrl={submitMongoUrl}
      operationError={operationError}
      phase={phase}
      selectedConnection={selectedConnection}
      selectedCollection={selectedCollection}
      selectedDatabase={selectedDatabase}
    />
  );
}
