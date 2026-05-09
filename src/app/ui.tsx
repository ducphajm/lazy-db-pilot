import {Box, Text} from 'ink';
import {Spinner, StatusMessage} from '@inkjs/ui';
import type {ReactNode} from 'react';
import {DatabaseType, ConnectionEnvironment} from '../connections/types.js';
import type {DatabaseConnection} from '../connections/types.js';
import {SelectableList} from '../tui/SelectableList.js';
import type {SelectableListItem} from '../tui/SelectableList.js';

enum ConnectionListAction {
  CreateConnection = 'create-connection',
}

export enum ConfirmDeleteAction {
  Cancel = 'cancel',
  Delete = 'delete',
}

export enum QuitConfirmationAction {
  Cancel = 'cancel',
  Quit = 'quit',
}

export enum RecoveryAction {
  CreateConnection = 'create-connection',
  SavedConnections = 'saved-connections',
}

export function QuitConfirmationPrompt({
  onSelect,
}: {
  readonly onSelect: (action: QuitConfirmationAction) => void;
}): React.JSX.Element {
  return (
    <ConfirmationModal
      title="Quit application?"
      message="Press y to quit or n to cancel."
      items={quitConfirmationItems}
      onSelect={onSelect}
    />
  );
}

function ConfirmationModal<T>({
  items,
  message,
  onSelect,
  title,
}: {
  readonly items: readonly SelectableListItem<T>[];
  readonly message: string;
  readonly onSelect: (action: T) => void;
  readonly title: string;
}): React.JSX.Element {
  return (
    <Box
      alignSelf="center"
      borderColor="yellow"
      borderStyle="round"
      flexDirection="column"
      paddingX={2}
      paddingY={1}
    >
      <Text color="yellow">{title}</Text>
      <Text>{message}</Text>
      <Box marginTop={1}>
        <SelectableList items={items} onSelect={onSelect} />
      </Box>
    </Box>
  );
}

export function ConnectionList({
  connections,
  onCreate,
  onDelete,
  onSelect,
}: {
  readonly connections: readonly DatabaseConnection[];
  readonly onCreate: () => void;
  readonly onDelete: (connection: DatabaseConnection) => void;
  readonly onSelect: (connection: DatabaseConnection) => void;
}): React.JSX.Element {
  const items: SelectableListItem<DatabaseConnection | ConnectionListAction>[] =
    [
      ...connections.map(connection => ({
        key: connection.name,
        label: getConnectionLabel(connection),
        value: connection,
      })),
      {
        key: ConnectionListAction.CreateConnection,
        label: 'Create connection',
        value: ConnectionListAction.CreateConnection,
      },
    ];

  return (
    <Box flexDirection="column">
      <SelectableList
        items={items}
        onFocusedInput={(input, _key, value) => {
          if (input !== 'd' || value === ConnectionListAction.CreateConnection) {
            return false;
          }

          onDelete(value);
          return true;
        }}
        onSelect={value => {
          if (value === ConnectionListAction.CreateConnection) {
            onCreate();
            return;
          }

          onSelect(value);
        }}
      />
      <Text dimColor>Enter/l select, d delete, q asks to quit.</Text>
    </Box>
  );
}

export function DeleteConfirmation({
  connection,
  onSelect,
}: {
  readonly connection: DatabaseConnection;
  readonly onSelect: (action: ConfirmDeleteAction) => void;
}): React.JSX.Element {
  return (
    <Screen>
      <StatusMessage variant="warning">
        Delete saved connection {connection.name}?
      </StatusMessage>
      <SelectableList items={deleteConfirmationItems} onSelect={onSelect} />
    </Screen>
  );
}

export function RecoveryScreen({
  message,
  onSelect,
  variant = 'error',
}: {
  readonly message: string;
  readonly onSelect: (action: RecoveryAction) => void;
  readonly variant?: 'error' | 'warning';
}): React.JSX.Element {
  return (
    <Screen>
      <StatusMessage variant={variant}>{message}</StatusMessage>
      <SelectableList items={recoveryItems} onSelect={onSelect} />
    </Screen>
  );
}

export function LoadingScreen({
  label,
}: {
  readonly label: string;
}): React.JSX.Element {
  return (
    <Screen>
      <Spinner label={label} />
    </Screen>
  );
}

export function Screen({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <Box flexDirection="column" gap={1}>
      {children}
    </Box>
  );
}

export function toListItems(
  values: readonly string[],
): SelectableListItem<string>[] {
  return values.map(value => ({
    key: value,
    label: value,
    value,
  }));
}

function getConnectionLabel(connection: DatabaseConnection): string {
  return `${connection.name} [${connection.type}/${connection.environment}]`;
}

export const databaseTypeItems: SelectableListItem<DatabaseType>[] = [
  {
    key: DatabaseType.MongoDB,
    label: 'MongoDB',
    value: DatabaseType.MongoDB,
  },
  {
    key: DatabaseType.Redis,
    label: 'Redis',
    value: DatabaseType.Redis,
  },
  {
    key: DatabaseType.SQLite,
    label: 'SQLite',
    value: DatabaseType.SQLite,
  },
];

export const environmentItems: SelectableListItem<ConnectionEnvironment>[] = [
  {
    key: ConnectionEnvironment.Local,
    label: 'local',
    value: ConnectionEnvironment.Local,
  },
  {
    key: ConnectionEnvironment.Development,
    label: 'development',
    value: ConnectionEnvironment.Development,
  },
  {
    key: ConnectionEnvironment.Production,
    label: 'production',
    value: ConnectionEnvironment.Production,
  },
];

const recoveryItems: SelectableListItem<RecoveryAction>[] = [
  {
    key: RecoveryAction.SavedConnections,
    label: 'Saved connections',
    value: RecoveryAction.SavedConnections,
  },
  {
    key: RecoveryAction.CreateConnection,
    label: 'Create connection',
    value: RecoveryAction.CreateConnection,
  },
];

const deleteConfirmationItems: SelectableListItem<ConfirmDeleteAction>[] = [
  {
    key: ConfirmDeleteAction.Delete,
    label: 'Delete connection',
    value: ConfirmDeleteAction.Delete,
  },
  {
    key: ConfirmDeleteAction.Cancel,
    label: 'Cancel',
    value: ConfirmDeleteAction.Cancel,
  },
];

const quitConfirmationItems: SelectableListItem<QuitConfirmationAction>[] = [
  {
    key: QuitConfirmationAction.Quit,
    label: 'Quit',
    value: QuitConfirmationAction.Quit,
  },
  {
    key: QuitConfirmationAction.Cancel,
    label: 'Cancel',
    value: QuitConfirmationAction.Cancel,
  },
];
