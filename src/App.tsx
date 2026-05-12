import {useApp} from 'ink';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {loadConnections} from './connections/persistence.js';
import {
  DatabaseType,
  type ConnectionInput,
  type DatabaseConnection,
} from './connections/types.js';
import {validateConnection} from './connections/validation.js';
import type {AppProps} from './app/AppProps.js';
import {AppView} from './app/AppView.js';
import {
  createEmptyConnectionFormDraft,
  type ConnectionFormDraft,
} from './app/ConnectionForm.js';
import {
  defaultCreateCollection,
  defaultDeleteConnection,
  defaultInsertCollectionDocument,
  defaultLoadCollectionDocuments,
  defaultLoadCollections,
  defaultLoadDatabases,
  defaultSaveConnection,
} from './app/defaultOperations.js';
import {CollectionDocumentTabStatus} from './app/documentTabs.js';
import {getConnectionErrorMessage} from './app/errors.js';
import {
  clampSidebarIndex,
  getMongoBrowserSidebarItems,
  MongoBrowserContainer,
} from './app/mongodbBrowser.js';
import {AppPhase} from './app/phases.js';
import {RecoveryAction} from './app/ui.js';
import {useAppInput} from './app/useAppInput.js';
import {useConnectionDeletion} from './app/useConnectionDeletion.js';
import {useCreateCollectionDraft} from './app/useCreateCollectionDraft.js';
import {useCreateDocumentDraft} from './app/useCreateDocumentDraft.js';
import {useDocumentTabs} from './app/useDocumentTabs.js';
import {useMongoBrowserLoading} from './app/useMongoBrowserLoading.js';

export function App({
  createCollection = defaultCreateCollection,
  insertCollectionDocument = defaultInsertCollectionDocument,
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
  const [collectionsByDatabaseName, setCollectionsByDatabaseName] = useState<
    ReadonlyMap<string, readonly string[]>
  >(new Map());
  const [, setSelectedCollection] = useState<string | null>(null);
  const [activeBrowserContainer, setActiveBrowserContainer] =
    useState<MongoBrowserContainer>(MongoBrowserContainer.LeftSidebar);
  const [expandedDatabaseNames, setExpandedDatabaseNames] = useState<
    ReadonlySet<string>
  >(new Set());
  const [selectedSidebarIndex, setSelectedSidebarIndex] = useState(0);
  const [isQuitConfirmationPending, setIsQuitConfirmationPending] =
    useState(false);
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
    moveDocumentCursor,
    openDocumentTab,
    reloadDocumentTab,
  } = useDocumentTabs({
    loadCollectionDocuments,
    selectedConnection,
    setPhase,
  });
  const {
    createDocumentDraft,
    cancelCreateDocument,
    startCreateDocument,
    submitCreateDocument,
    updateCreateDocumentText,
  } = useCreateDocumentDraft({
    insertCollectionDocument,
    reloadDocumentTab,
    selectedConnection,
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
    setCollectionsByDatabaseName(new Map());
    clearDocumentTabs();
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setExpandedDatabaseNames(new Set());
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
    setCollectionsByDatabaseName(new Map());
    setSelectedCollection(null);
    clearDocumentTabs();
    setSelectedDatabase(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setExpandedDatabaseNames(new Set());
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
    setCollectionsByDatabaseName(previousCollections => {
      const nextCollections = new Map(previousCollections);
      nextCollections.delete(databaseName);
      return nextCollections;
    });
    setSelectedCollection(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setExpandedDatabaseNames(previousDatabaseNames => {
      const nextDatabaseNames = new Set(previousDatabaseNames);
      nextDatabaseNames.add(databaseName);
      return nextDatabaseNames;
    });
    setPhase(AppPhase.LoadingCollections);
  }, []);

  const selectCollection = useCallback(({
    collectionName,
    databaseName,
  }: {
    readonly collectionName: string;
    readonly databaseName: string;
  }) => {
    if (selectedConnection === null) {
      return;
    }

    setSelectedDatabase(databaseName);
    setSelectedCollection(collectionName);
    setOperationError(null);
    setActiveBrowserContainer(MongoBrowserContainer.RightData);
    openDocumentTab({collectionName, databaseName});
  }, [openDocumentTab, selectedConnection]);

  const closeDatabaseFolder = useCallback((databaseName: string) => {
    setOperationError(null);
    setExpandedDatabaseNames(previousDatabaseNames => {
      const nextDatabaseNames = new Set(previousDatabaseNames);
      nextDatabaseNames.delete(databaseName);
      return nextDatabaseNames;
    });
    setSelectedCollection(null);
    setPhase(AppPhase.DatabasesLoaded);
  }, []);

  const focusLeftSidebar = useCallback(() => {
    setOperationError(null);
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
  }, []);
  const reloadDatabaseCollections = useCallback((databaseName: string) => {
    setSelectedDatabase(databaseName);
    setCollectionsByDatabaseName(previousCollections => {
      const nextCollections = new Map(previousCollections);
      nextCollections.delete(databaseName);
      return nextCollections;
    });
    setExpandedDatabaseNames(previousDatabaseNames => {
      const nextDatabaseNames = new Set(previousDatabaseNames);
      nextDatabaseNames.add(databaseName);
      return nextDatabaseNames;
    });
    setActiveBrowserContainer(MongoBrowserContainer.LeftSidebar);
    setOperationError(null);
    setPhase(AppPhase.LoadingCollections);
  }, []);
  const {
    createCollectionDraft,
    cancelCreateCollection,
    startCreateCollection,
    submitCreateCollection,
    updateCreateCollectionName,
  } = useCreateCollectionDraft({
    createCollection,
    onCreated: reloadDatabaseCollections,
    selectedConnection,
  });

  const browserSidebarItems = useMemo(
    () =>
      getMongoBrowserSidebarItems({
        collectionsByDatabaseName,
        databases,
        expandedDatabaseNames,
      }),
    [collectionsByDatabaseName, databases, expandedDatabaseNames],
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
  const requestQuitConfirmation = useCallback(() => {
    setIsQuitConfirmationPending(true);
  }, []);
  const cancelQuitConfirmation = useCallback(() => {
    setIsQuitConfirmationPending(false);
  }, []);
  const confirmQuitConfirmation = useCallback(() => {
    exitApp();
  }, [exitApp]);

  useAppInput({
    activeBrowserContainer,
    browserSidebarItems,
    canMoveDocumentCursor:
      activeDocumentTab?.status === CollectionDocumentTabStatus.Loaded,
    closeActiveDocumentTab,
    closeDatabaseFolder,
    cancelCreateCollection,
    cancelCreateDocument,
    confirmQuitConfirmation,
    focusLeftSidebar,
    hasOpenDocumentTabs: documentTabs.length > 0,
    isCreateDocumentDraftActive: createDocumentDraft !== null,
    isCreateCollectionDraftActive: createCollectionDraft !== null,
    isQuitConfirmationPending,
    moveActiveDocumentTab,
    moveDocumentCursor,
    phase,
    startCreateCollection,
    startCreateDocument: () => startCreateDocument(activeDocumentTab),
    selectedSidebarIndex,
    selectCollection,
    selectDatabase,
    setActiveBrowserContainer,
    setSelectedSidebarIndex,
    cancelQuitConfirmation,
    requestQuitConfirmation,
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

  useMongoBrowserLoading({
    loadCollections,
    loadDatabases,
    phase,
    selectedConnection,
    selectedDatabase,
    setCollectionsByDatabaseName,
    setDatabases,
    setExpandedDatabaseNames,
    setOperationError,
    setPhase,
    setSelectedCollection,
  });

  return <AppView
    activeBrowserContainer={activeBrowserContainer}
    activeDocumentTab={activeDocumentTab}
    browserSidebarItems={browserSidebarItems}
    connectionDraft={draft}
    connections={connections}
    createCollectionDraft={createCollectionDraft}
    createDocumentDraft={createDocumentDraft}
    documentTabs={documentTabs}
    inputError={inputError}
    isQuitConfirmationPending={isQuitConfirmationPending}
    onCancelConnectionForm={cancelConnectionForm}
    onCancelCreateCollection={cancelCreateCollection}
    onCancelCreateDocument={cancelCreateDocument}
    onCancelQuitConfirmation={cancelQuitConfirmation}
    onConfirmQuitConfirmation={confirmQuitConfirmation}
    onCreateConnection={() => resetCreation()}
    onDeleteConnection={requestConnectionDeletion}
    onDeleteConnectionConfirmation={handleDeleteConfirmation}
    onRecovery={handleRecovery}
    onSelectConnection={selectConnection}
    onSubmitConnectionForm={submitConnectionForm}
    onSubmitCreateCollection={submitCreateCollection}
    onSubmitCreateDocument={submitCreateDocument}
    onUpdateCreateCollectionName={updateCreateCollectionName}
    onUpdateConnectionDraft={setDraft}
    onUpdateCreateDocumentText={updateCreateDocumentText}
    operationError={operationError}
    phase={phase}
    selectedConnection={selectedConnection}
    selectedSidebarIndex={selectedSidebarIndex}
  />;
}
