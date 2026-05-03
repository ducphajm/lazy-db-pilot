import {useApp} from 'ink';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {loadConnections} from './connections/persistence.js';
import {
  DatabaseType,
  type ConnectionInput,
  type DatabaseConnection,
} from './connections/types.js';
import {validateConnection} from './connections/validation.js';
import {MongoOperation} from './mongodb/errors.js';
import type {AppProps} from './app/AppProps.js';
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
} from './app/defaultOperations.js';
import {CollectionDocumentTabStatus} from './app/documentTabs.js';
import {getConnectionErrorMessage, getDisplayError} from './app/errors.js';
import {
  clampSidebarIndex,
  getMongoBrowserSidebarItems,
  MongoBrowserContainer,
} from './app/mongodbBrowser.js';
import {AppPhase} from './app/phases.js';
import {RecoveryAction} from './app/ui.js';
import {useAppInput} from './app/useAppInput.js';
import {
  useConnectionDeletion,
} from './app/useConnectionDeletion.js';
import {useDocumentTabs} from './app/useDocumentTabs.js';

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
  const [, setSelectedCollection] = useState<string | null>(null);
  const [activeBrowserContainer, setActiveBrowserContainer] =
    useState<MongoBrowserContainer>(MongoBrowserContainer.LeftSidebar);
  const [isDatabaseFolderOpen, setIsDatabaseFolderOpen] = useState(false);
  const [selectedSidebarIndex, setSelectedSidebarIndex] = useState(0);
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
  const {
    activeDocumentTab,
    clearDocumentTabs,
    closeActiveDocumentTab,
    documentTabs,
    moveActiveDocumentTab,
    moveSelectedDocument,
    openDocumentTab,
  } = useDocumentTabs({
    loadCollectionDocuments,
    selectedConnection,
    setPhase,
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
    clearDocumentTabs();
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setIsDatabaseFolderOpen(false);
    setSelectedSidebarIndex(0);
    setDatabases([]);
    setPhase(
      connections.length > 0
        ? AppPhase.ConnectionsLoaded
        : AppPhase.CreatingConnection,
    );
  }, [clearDocumentTabs, clearPendingDeletion, connections.length]);
  const cancelConnectionForm = useCallback(() => {
    setDraft(createEmptyConnectionFormDraft());
    setPendingConnection(null);
    setInputError(null);
    showConnectionList();
  }, [showConnectionList]);
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
    clearDocumentTabs();
    setSelectedDatabase(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setIsDatabaseFolderOpen(false);
    setSelectedSidebarIndex(0);

    if (connection.type !== DatabaseType.MongoDB) {
      setPhase(AppPhase.UnsupportedConnection);
      return;
    }

    setPhase(AppPhase.LoadingDatabases);
  }, [clearDocumentTabs]);

  const selectDatabase = useCallback((databaseName: string) => {
    setSelectedDatabase(databaseName);
    setOperationError(null);
    setCollections([]);
    setSelectedCollection(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setIsDatabaseFolderOpen(true);
    setPhase(AppPhase.LoadingCollections);
  }, []);

  const selectCollection = useCallback((collectionName: string) => {
    if (selectedConnection === null || selectedDatabase === null) {
      return;
    }

    setSelectedCollection(collectionName);
    setOperationError(null);
    setActiveBrowserContainer(MongoBrowserContainer.RightData);
    openDocumentTab({collectionName, databaseName: selectedDatabase});
  }, [openDocumentTab, selectedConnection, selectedDatabase]);

  const closeDatabaseFolder = useCallback(() => {
    setOperationError(null);
    setIsDatabaseFolderOpen(false);
    setSelectedCollection(null);
    setPhase(AppPhase.DatabasesLoaded);
  }, []);

  const focusLeftSidebar = useCallback(() => {
    setOperationError(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
  }, []);

  const browserSidebarItems = useMemo(
    () =>
      getMongoBrowserSidebarItems({
        collections,
        databases,
        isDatabaseFolderOpen,
        selectedDatabase,
      }),
    [collections, databases, isDatabaseFolderOpen, selectedDatabase],
  );

  useEffect(() => {
    setSelectedSidebarIndex(index =>
      clampSidebarIndex(index, browserSidebarItems.length),
    );
  }, [browserSidebarItems.length]);

  const handleRecovery = useCallback((action: RecoveryAction) => {
    if (action === RecoveryAction.CreateConnection) {
      resetCreation();
      return;
    }

    showConnectionList();
  }, [resetCreation, showConnectionList]);

  useAppInput({
    activeBrowserContainer,
    browserSidebarItems,
    canMoveSelectedDocument:
      activeDocumentTab?.status === CollectionDocumentTabStatus.Loaded,
    closeActiveDocumentTab,
    closeDatabaseFolder,
    exitApp,
    focusLeftSidebar,
    hasOpenDocumentTabs: documentTabs.length > 0,
    moveActiveDocumentTab,
    moveSelectedDocument,
    phase,
    selectedSidebarIndex,
    selectCollection,
    selectDatabase,
    setActiveBrowserContainer,
    setSelectedSidebarIndex,
    showConnectionList,
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

  return (
    <AppView
      activeBrowserContainer={activeBrowserContainer}
      activeDocumentTab={activeDocumentTab}
      browserSidebarItems={browserSidebarItems}
      connectionDraft={draft}
      connections={connections}
      documentTabs={documentTabs}
      inputError={inputError}
      onCancelConnectionForm={cancelConnectionForm}
      onCreateConnection={() => resetCreation()}
      onDeleteConnection={requestConnectionDeletion}
      onDeleteConnectionConfirmation={handleDeleteConfirmation}
      onRecovery={handleRecovery}
      onSelectConnection={selectConnection}
      onSubmitConnectionForm={submitConnectionForm}
      onUpdateConnectionDraft={setDraft}
      operationError={operationError}
      phase={phase}
      selectedConnection={selectedConnection}
      selectedSidebarIndex={selectedSidebarIndex}
    />
  );
}
