import {Text} from 'ink';
import {StatusMessage} from '@inkjs/ui';
import type {DatabaseConnection} from '../connections/types.js';
import {ConnectionForm, type ConnectionFormDraft} from './ConnectionForm.js';
import {MongoBrowserLayout} from './MongoBrowserLayout.js';
import type {CollectionDocumentTab} from './documentTabs.js';
import {AppPhase} from './phases.js';
import {
  ConfirmDeleteAction,
  ConnectionList,
  DeleteConfirmation,
  LoadingScreen,
  RecoveryAction,
  RecoveryScreen,
  Screen,
} from './ui.js';
import {
  MongoBrowserContainer,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';

export type AppViewProps = {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly activeBrowserContainer: MongoBrowserContainer;
  readonly browserSidebarItems: readonly MongoBrowserSidebarItem[];
  readonly connectionDraft: ConnectionFormDraft;
  readonly connections: readonly DatabaseConnection[];
  readonly inputError: string | null;
  readonly onCreateConnection: () => void;
  readonly onDeleteConnection: (connection: DatabaseConnection) => void;
  readonly onDeleteConnectionConfirmation: (action: ConfirmDeleteAction) => void;
  readonly onCancelConnectionForm: () => void;
  readonly onSubmitConnectionForm: () => void;
  readonly onUpdateConnectionDraft: (draft: ConnectionFormDraft) => void;
  readonly onRecovery: (action: RecoveryAction) => void;
  readonly onSelectConnection: (connection: DatabaseConnection) => void;
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedConnection: DatabaseConnection | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly selectedSidebarIndex: number;
};

export function AppView({
  activeDocumentTab,
  activeBrowserContainer,
  browserSidebarItems,
  connectionDraft,
  connections,
  inputError,
  onCreateConnection,
  onDeleteConnection,
  onDeleteConnectionConfirmation,
  onCancelConnectionForm,
  onSubmitConnectionForm,
  onUpdateConnectionDraft,
  onRecovery,
  onSelectConnection,
  operationError,
  phase,
  selectedConnection,
  documentTabs,
  selectedSidebarIndex,
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
    return renderBrowser();
  }

  if (
    phase === AppPhase.LoadingCollections ||
    phase === AppPhase.CollectionsLoaded ||
    phase === AppPhase.CollectionsEmpty ||
    phase === AppPhase.CollectionError ||
    phase === AppPhase.LoadingCollectionData ||
    phase === AppPhase.CollectionDataError ||
    phase === AppPhase.CollectionDataEmpty ||
    phase === AppPhase.CollectionDataLoaded
  ) {
    return renderBrowser();
  }

  return renderBrowser();

  function renderBrowser(): React.JSX.Element {
    void onRecovery;

    return (
      <MongoBrowserLayout
        activeContainer={activeBrowserContainer}
        activeDocumentTab={activeDocumentTab}
        documentTabs={documentTabs}
        operationError={operationError}
        phase={phase}
        selectedSidebarIndex={selectedSidebarIndex}
        sidebarItems={browserSidebarItems}
      />
    );
  }
}
