import {Text} from 'ink';
import {StatusMessage, TextInput} from '@inkjs/ui';
import type {ConnectionEnvironment, DatabaseType} from '../connections/types.js';
import type {DatabaseConnection} from '../connections/types.js';
import {SelectableList} from '../tui/SelectableList.js';
import {AppPhase} from './phases.js';
import {
  ConnectionList,
  LoadingScreen,
  RecoveryAction,
  RecoveryScreen,
  Screen,
  databaseTypeItems,
  environmentItems,
  toListItems,
} from './ui.js';

export type AppViewProps = {
  readonly collections: readonly string[];
  readonly connections: readonly DatabaseConnection[];
  readonly databases: readonly string[];
  readonly inputError: string | null;
  readonly inputKey: number;
  readonly onCreateConnection: () => void;
  readonly onRecovery: (action: RecoveryAction) => void;
  readonly onSelectConnection: (connection: DatabaseConnection) => void;
  readonly onSelectDatabase: (databaseName: string) => void;
  readonly onSubmitConnectionName: (input: string) => void;
  readonly onSubmitDatabaseType: (type: DatabaseType) => void;
  readonly onSubmitEnvironment: (environment: ConnectionEnvironment) => void;
  readonly onSubmitMongoUrl: (input: string) => void;
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedConnection: DatabaseConnection | null;
  readonly selectedDatabase: string | null;
};

export function AppView({
  collections,
  connections,
  databases,
  inputError,
  inputKey,
  onCreateConnection,
  onRecovery,
  onSelectConnection,
  onSelectDatabase,
  onSubmitConnectionName,
  onSubmitDatabaseType,
  onSubmitEnvironment,
  onSubmitMongoUrl,
  operationError,
  phase,
  selectedConnection,
  selectedDatabase,
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
          onSelect={onSelectConnection}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.CreatingName) {
    return (
      <Screen>
        <Text>Connection name</Text>
        {inputError ? (
          <StatusMessage variant="error">{inputError}</StatusMessage>
        ) : null}
        <TextInput key={inputKey} onSubmit={onSubmitConnectionName} />
      </Screen>
    );
  }

  if (phase === AppPhase.CreatingType) {
    return (
      <Screen>
        <Text>Database type</Text>
        <SelectableList
          items={databaseTypeItems}
          onSelect={onSubmitDatabaseType}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.CreatingEnvironment) {
    return (
      <Screen>
        <Text>Environment</Text>
        <SelectableList
          items={environmentItems}
          onSelect={onSubmitEnvironment}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.CreatingMongoUrl) {
    return (
      <Screen>
        <Text>MongoDB URL</Text>
        {inputError ? (
          <StatusMessage variant="error">{inputError}</StatusMessage>
        ) : null}
        <TextInput
          key={inputKey}
          placeholder="mongodb://host:port"
          onSubmit={onSubmitMongoUrl}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.SavingConnection) {
    return <LoadingScreen label="Saving connection" />;
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
        collections.map(collection => (
          <Text key={collection}>- {collection}</Text>
        ))
      )}
      <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
    </Screen>
  );
}
