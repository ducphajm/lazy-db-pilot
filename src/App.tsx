import {useApp, useInput} from 'ink';
import {useCallback, useEffect, useState} from 'react';
import {loadConnections} from './connections/persistence.js';
import {
  DatabaseType,
  type ConnectionInput,
  type DatabaseConnection,
} from './connections/types.js';
import {validateConnection} from './connections/validation.js';
import {MongoOperation} from './mongodb/errors.js';
import type {MongoCollectionDocument} from './mongodb/service.js';
import {AppView} from './app/AppView.js';
import {
  createEmptyConnectionFormDraft,
  type ConnectionFormDraft,
} from './app/ConnectionForm.js';
import {
  defaultDeleteConnection,
  defaultLoadCollectionDocuments,
  defaultLoadCollections,
  defaultLoadDatabases,
  defaultSaveConnection,
  type SaveConnection,
} from './app/defaultOperations.js';
import {getConnectionErrorMessage, getDisplayError} from './app/errors.js';
import {AppPhase} from './app/phases.js';
import {RecoveryAction} from './app/ui.js';
import {
  useConnectionDeletion,
  type DeleteConnection,
} from './app/useConnectionDeletion.js';
import type {
  LoadCollectionDocuments,
  LoadCollections,
  LoadDatabases,
} from './types.js';

type AppProps = {
  readonly loadCollectionDocuments?: LoadCollectionDocuments;
  readonly loadCollections?: LoadCollections;
  readonly loadConnectionsList?: () => Promise<DatabaseConnection[]>;
  readonly loadDatabases?: LoadDatabases;
  readonly onExit?: () => void;
  readonly deleteConnectionByName?: DeleteConnection;
  readonly saveConnection?: SaveConnection;
};

export function App({
  loadCollectionDocuments = defaultLoadCollectionDocuments,
  loadCollections = defaultLoadCollections,
  loadConnectionsList = loadConnections,
  loadDatabases = defaultLoadDatabases,
  onExit,
  deleteConnectionByName = defaultDeleteConnection,
  saveConnection = defaultSaveConnection,
}: AppProps): React.JSX.Element {
  const {exit} = useApp();
  const [phase, setPhase] = useState<AppPhase>(AppPhase.LoadingConnections);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] =
    useState<DatabaseConnection | null>(null);
  const [draft, setDraft] = useState<ConnectionFormDraft>(
    createEmptyConnectionFormDraft(),
  );
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
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0);
  const exitApp = onExit ?? exit;
  const {
    clearPendingDeletion,
    handleDeleteConfirmation,
    requestConnectionDeletion,
  } = useConnectionDeletion({
    connections,
    deleteConnectionByName,
    phase,
    setConnections,
    setOperationError,
    setPhase,
    setSelectedConnection,
  });

  const resetCreation = useCallback((message: string | null = null) => {
    setDraft(createEmptyConnectionFormDraft());
    setPendingConnection(null);
    setInputError(message);
    setPhase(AppPhase.CreatingConnection);
  }, []);

  const showConnectionList = useCallback(() => {
    setOperationError(null);
    setSelectedConnection(null);
    clearPendingDeletion();
    setSelectedDatabase(null);
    setSelectedCollection(null);
    setCollections([]);
    setCollectionDocuments([]);
    setSelectedDocumentIndex(0);
    setDatabases([]);
    setPhase(
      connections.length > 0
        ? AppPhase.ConnectionsLoaded
        : AppPhase.CreatingConnection,
    );
  }, [clearPendingDeletion, connections.length]);

  const submitConnectionForm = useCallback(() => {
    const name = draft.name.trim();

    if (name.length === 0) {
      setInputError('Connection name is required.');
      return;
    }

    if (connections.some(connection => connection.name === name)) {
      setInputError('Connection name must be unique.');
      return;
    }

    if (draft.type === null || draft.environment === null) {
      setInputError('Connection details are incomplete.');
      return;
    }

    const input: ConnectionInput = {
      name,
      type: draft.type,
      environment: draft.environment,
      details:
        draft.type === DatabaseType.MongoDB ? {url: draft.mongoUrl} : {},
    };

    try {
      const connection = validateConnection(input, connections);

      setPendingConnection(connection);
      setInputError(null);
      setPhase(AppPhase.SavingConnection);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setInputError(error.message);
      } else {
        setInputError('Invalid connection details.');
      }
    }
  }, [connections, draft]);

  const selectConnection = useCallback((connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setOperationError(null);
    setDatabases([]);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setSelectedDocumentIndex(0);
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
    setSelectedDocumentIndex(0);
    setPhase(AppPhase.LoadingCollections);
  }, []);

  const selectCollection = useCallback((collectionName: string) => {
    setSelectedCollection(collectionName);
    setCollectionDocuments([]);
    setSelectedDocumentIndex(0);
    setOperationError(null);
    setPhase(AppPhase.LoadingCollectionData);
  }, []);

  const returnToDatabases = useCallback(() => {
    setOperationError(null);
    setCollections([]);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setSelectedDocumentIndex(0);
    setPhase(AppPhase.DatabasesLoaded);
  }, []);

  const returnToCollections = useCallback(() => {
    setOperationError(null);
    setSelectedCollection(null);
    setCollectionDocuments([]);
    setSelectedDocumentIndex(0);
    setPhase(
      collections.length > 0
        ? AppPhase.CollectionsLoaded
        : AppPhase.CollectionsEmpty,
    );
  }, [collections.length]);

  const moveSelectedDocument = useCallback(
    (direction: -1 | 1) => {
      setSelectedDocumentIndex(currentIndex =>
        Math.min(
          Math.max(currentIndex + direction, 0),
          Math.max(collectionDocuments.length - 1, 0),
        ),
      );
    },
    [collectionDocuments.length],
  );

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

    if (input === 'q' && phase !== AppPhase.CreatingConnection) {
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

    if (phase === AppPhase.CollectionDataLoaded && input === 'j') {
      moveSelectedDocument(1);
    }

    if (phase === AppPhase.CollectionDataLoaded && input === 'k') {
      moveSelectedDocument(-1);
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
            : AppPhase.CreatingConnection,
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
        setDraft(createEmptyConnectionFormDraft());
        setPhase(AppPhase.ConnectionsLoaded);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setPendingConnection(null);
        setInputError(getConnectionErrorMessage(error));
        setPhase(AppPhase.CreatingConnection);
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
        setSelectedDocumentIndex(0);
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
        setSelectedDocumentIndex(0);
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
      connectionDraft={draft}
      connections={connections}
      databases={databases}
      inputError={inputError}
      onCreateConnection={() => resetCreation()}
      onDeleteConnection={requestConnectionDeletion}
      onDeleteConnectionConfirmation={handleDeleteConfirmation}
      onRecovery={handleRecovery}
      onSelectConnection={selectConnection}
      onSelectCollection={selectCollection}
      onSelectDatabase={selectDatabase}
      onSubmitConnectionForm={submitConnectionForm}
      onUpdateConnectionDraft={setDraft}
      operationError={operationError}
      phase={phase}
      selectedConnection={selectedConnection}
      selectedCollection={selectedCollection}
      selectedDatabase={selectedDatabase}
      selectedDocumentIndex={selectedDocumentIndex}
    />
  );
}
