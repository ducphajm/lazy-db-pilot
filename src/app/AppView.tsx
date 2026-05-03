import {Text} from 'ink';
import {StatusMessage} from '@inkjs/ui';
import type {DatabaseConnection} from '../connections/types.js';
import type {MongoCollectionDocument} from '../mongodb/service.js';
import {DocumentCardList} from '../tui/DocumentCardList.js';
import {SelectableList} from '../tui/SelectableList.js';
import {ConnectionForm, type ConnectionFormDraft} from './ConnectionForm.js';
import {AppPhase} from './phases.js';
import {
  ConfirmDeleteAction,
  ConnectionList,
  DeleteConfirmation,
  LoadingScreen,
  RecoveryAction,
  RecoveryScreen,
  Screen,
  toListItems,
} from './ui.js';

export type AppViewProps = {
  readonly collectionDocuments: readonly MongoCollectionDocument[];
  readonly collections: readonly string[];
  readonly connectionDraft: ConnectionFormDraft;
  readonly connections: readonly DatabaseConnection[];
  readonly databases: readonly string[];
  readonly inputError: string | null;
  readonly onCreateConnection: () => void;
  readonly onDeleteConnection: (connection: DatabaseConnection) => void;
  readonly onDeleteConnectionConfirmation: (action: ConfirmDeleteAction) => void;
  readonly onCancelConnectionForm: () => void;
  readonly onSubmitConnectionForm: () => void;
  readonly onUpdateConnectionDraft: (draft: ConnectionFormDraft) => void;
  readonly onRecovery: (action: RecoveryAction) => void;
  readonly onSelectConnection: (connection: DatabaseConnection) => void;
  readonly onSelectCollection: (collectionName: string) => void;
  readonly onSelectDatabase: (databaseName: string) => void;
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedConnection: DatabaseConnection | null;
  readonly selectedCollection: string | null;
  readonly selectedDatabase: string | null;
  readonly selectedDocumentIndex: number;
};

export function AppView({
  collectionDocuments,
  collections,
  connectionDraft,
  connections,
  databases,
  inputError,
  onCreateConnection,
  onDeleteConnection,
  onDeleteConnectionConfirmation,
  onCancelConnectionForm,
  onSubmitConnectionForm,
  onUpdateConnectionDraft,
  onRecovery,
  onSelectConnection,
  onSelectCollection,
  onSelectDatabase,
  operationError,
  phase,
  selectedConnection,
  selectedCollection,
  selectedDatabase,
  selectedDocumentIndex,
}: AppViewProps): React.JSX.Element {
  if (phase === AppPhase.LoadingConnections) {
    return <LoadingScreen label="Loading saved connections" />;
  }

  if (phase === AppPhase.ConnectionsError) {
    return (
      <RecoveryScreen
        message={operationError ?? 'Unable to load saved connections.'}
        onSelect={onRecovery}
      />
    );
  }

  if (phase === AppPhase.ConnectionsLoaded) {
    return (
      <Screen>
        <Text>Saved connections</Text>
        <ConnectionList
          connections={connections}
          onCreate={onCreateConnection}
          onDelete={onDeleteConnection}
          onSelect={onSelectConnection}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.CreatingConnection) {
    return (
      <Screen>
        {inputError ? (
          <StatusMessage variant="error">{inputError}</StatusMessage>
        ) : null}
        <ConnectionForm
          draft={connectionDraft}
          onCancel={onCancelConnectionForm}
          onChange={onUpdateConnectionDraft}
          onSubmit={onSubmitConnectionForm}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.SavingConnection) {
    return <LoadingScreen label="Saving connection" />;
  }

  if (phase === AppPhase.ConfirmingConnectionDeletion && selectedConnection !== null) {
    return (
      <DeleteConfirmation
        connection={selectedConnection}
        onSelect={onDeleteConnectionConfirmation}
      />
    );
  }

  if (phase === AppPhase.DeletingConnection) {
    return <LoadingScreen label="Deleting connection" />;
  }

  if (phase === AppPhase.UnsupportedConnection) {
    return (
      <RecoveryScreen
        message={`${selectedConnection?.type ?? 'Selected'} connections are not supported yet.`}
        onSelect={onRecovery}
        variant="warning"
      />
    );
  }

  if (phase === AppPhase.LoadingDatabases) {
    return (
      <LoadingScreen
        label={`Loading databases for ${selectedConnection?.name ?? 'connection'}`}
      />
    );
  }

  if (phase === AppPhase.DatabaseError) {
    return (
      <RecoveryScreen
        message={operationError ?? 'Unable to load databases.'}
        onSelect={onRecovery}
      />
    );
  }

  if (phase === AppPhase.DatabasesEmpty) {
    return (
      <RecoveryScreen
        message="No databases are available for this connection."
        onSelect={onRecovery}
        variant="warning"
      />
    );
  }

  if (phase === AppPhase.DatabasesLoaded) {
    return (
      <Screen>
        <StatusMessage variant="success">Databases loaded.</StatusMessage>
        <Text>Select a database</Text>
        <SelectableList
          items={toListItems(databases)}
          onSelect={onSelectDatabase}
        />
        <Text dimColor>Press h to return to saved connections, q or Ctrl+C to exit.</Text>
      </Screen>
    );
  }

  if (phase === AppPhase.LoadingCollections) {
    return <LoadingScreen label="Loading collections" />;
  }

  if (phase === AppPhase.CollectionError) {
    return (
      <RecoveryScreen
        message={operationError ?? 'Unable to load collections.'}
        onSelect={onRecovery}
      />
    );
  }

  if (phase === AppPhase.LoadingCollectionData) {
    return (
      <LoadingScreen
        label={`Loading documents from ${selectedCollection ?? 'collection'}`}
      />
    );
  }

  if (phase === AppPhase.CollectionDataError) {
    return (
      <Screen>
        <StatusMessage variant="error">
          {operationError ?? 'Unable to load documents from the selected collection.'}
        </StatusMessage>
        <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
      </Screen>
    );
  }

  if (phase === AppPhase.CollectionDataEmpty) {
    return (
      <Screen>
        <StatusMessage variant="warning">
          No documents found in {selectedCollection ?? 'collection'}.
        </StatusMessage>
        <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
      </Screen>
    );
  }

  if (phase === AppPhase.CollectionDataLoaded) {
    return (
      <Screen>
        <StatusMessage variant="success">
          Documents in {selectedCollection ?? 'collection'}
        </StatusMessage>
        <DocumentCardList
          documents={collectionDocuments}
          selectedIndex={selectedDocumentIndex}
        />
        <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusMessage variant="success">
        {selectedDatabase === null
          ? 'Collections loaded.'
          : `Collections in ${selectedDatabase}`}
      </StatusMessage>
      {phase === AppPhase.CollectionsEmpty ? (
        <Text>No collections found.</Text>
      ) : (
        <SelectableList
          items={toListItems(collections)}
          onSelect={onSelectCollection}
        />
      )}
      <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
    </Screen>
  );
}
