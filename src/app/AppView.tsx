import {Text} from 'ink';
import {StatusMessage} from '@inkjs/ui';
import type {SetStateAction} from 'react';
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
  QuitConfirmationAction,
  QuitConfirmationPrompt,
  RecoveryAction,
  RecoveryScreen,
  Screen,
} from './ui.js';
import {
  MongoBrowserContainer,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';
import type {CreateDocumentDraft} from './createDocument.js';
import type {CreateCollectionDraft} from './createCollection.js';

export type AppViewProps = {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly activeBrowserContainer: MongoBrowserContainer;
  readonly browserSidebarItems: readonly MongoBrowserSidebarItem[];
  readonly connectionDraft: ConnectionFormDraft;
  readonly connections: readonly DatabaseConnection[];
  readonly createCollectionDraft: CreateCollectionDraft | null;
  readonly createDocumentDraft: CreateDocumentDraft | null;
  readonly inputError: string | null;
  readonly isQuitConfirmationPending: boolean;
  readonly onCancelQuitConfirmation: () => void;
  readonly onCreateConnection: () => void;
  readonly onDeleteConnection: (connection: DatabaseConnection) => void;
  readonly onDeleteConnectionConfirmation: (action: ConfirmDeleteAction) => void;
  readonly onConfirmQuitConfirmation: () => void;
  readonly onCancelConnectionForm: () => void;
  readonly onCancelCreateCollection: () => void;
  readonly onCancelCreateDocument: () => void;
  readonly onSubmitConnectionForm: () => void;
  readonly onSubmitCreateCollection: () => void;
  readonly onSubmitCreateDocument: () => void;
  readonly onUpdateCreateCollectionName: (text: SetStateAction<string>) => void;
  readonly onUpdateConnectionDraft: (draft: ConnectionFormDraft) => void;
  readonly onUpdateCreateDocumentText: (text: SetStateAction<string>) => void;
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
  createCollectionDraft,
  createDocumentDraft,
  inputError,
  isQuitConfirmationPending,
  onCancelQuitConfirmation,
  onCreateConnection,
  onDeleteConnection,
  onDeleteConnectionConfirmation,
  onConfirmQuitConfirmation,
  onCancelConnectionForm,
  onCancelCreateCollection,
  onCancelCreateDocument,
  onSubmitConnectionForm,
  onSubmitCreateCollection,
  onSubmitCreateDocument,
  onUpdateCreateCollectionName,
  onUpdateConnectionDraft,
  onUpdateCreateDocumentText,
  onRecovery,
  onSelectConnection,
  operationError,
  phase,
  selectedConnection,
  documentTabs,
  selectedSidebarIndex,
}: AppViewProps): React.JSX.Element {
  if (isQuitConfirmationPending) {
    return (
      <Screen>
        <QuitConfirmationPrompt onSelect={handleQuitConfirmationSelect} />
      </Screen>
    );
  }

  if (phase === AppPhase.LoadingConnections) {
    return renderWithQuitConfirmation(
      <LoadingScreen label="Loading saved connections" />,
    );
  }

  if (phase === AppPhase.ConnectionsError) {
    return renderWithQuitConfirmation(
      <RecoveryScreen
        message={operationError ?? 'Unable to load saved connections.'}
        onSelect={onRecovery}
      />,
    );
  }

  if (phase === AppPhase.ConnectionsLoaded) {
    return renderWithQuitConfirmation(
      <Screen>
        <Text>Saved connections</Text>
        <ConnectionList
          connections={connections}
          onCreate={onCreateConnection}
          onDelete={onDeleteConnection}
          onSelect={onSelectConnection}
        />
      </Screen>,
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
    return renderWithQuitConfirmation(<LoadingScreen label="Saving connection" />);
  }

  if (phase === AppPhase.ConfirmingConnectionDeletion && selectedConnection !== null) {
    return renderWithQuitConfirmation(
      <DeleteConfirmation
        connection={selectedConnection}
        onSelect={onDeleteConnectionConfirmation}
      />,
    );
  }

  if (phase === AppPhase.DeletingConnection) {
    return renderWithQuitConfirmation(
      <LoadingScreen label="Deleting connection" />,
    );
  }

  if (phase === AppPhase.UnsupportedConnection) {
    return renderWithQuitConfirmation(
      <RecoveryScreen
        message={`${selectedConnection?.type ?? 'Selected'} connections are not supported yet.`}
        onSelect={onRecovery}
        variant="warning"
      />,
    );
  }

  if (phase === AppPhase.LoadingDatabases) {
    return renderWithQuitConfirmation(
      <LoadingScreen
        label={`Loading databases for ${selectedConnection?.name ?? 'connection'}`}
      />,
    );
  }

  if (phase === AppPhase.DatabaseError) {
    return renderWithQuitConfirmation(
      <RecoveryScreen
        message={operationError ?? 'Unable to load databases.'}
        onSelect={onRecovery}
      />,
    );
  }

  if (phase === AppPhase.DatabasesEmpty) {
    return renderWithQuitConfirmation(
      <RecoveryScreen
        message="No databases are available for this connection."
        onSelect={onRecovery}
        variant="warning"
      />,
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

    return renderWithQuitConfirmation(
      <MongoBrowserLayout
        activeContainer={activeBrowserContainer}
        activeDocumentTab={activeDocumentTab}
        createCollectionDraft={createCollectionDraft}
        createDocumentDraft={createDocumentDraft}
        documentTabs={documentTabs}
        operationError={operationError}
        phase={phase}
        selectedSidebarIndex={selectedSidebarIndex}
        sidebarItems={browserSidebarItems}
        onCancelCreateCollection={onCancelCreateCollection}
        onCancelCreateDocument={onCancelCreateDocument}
        onSubmitCreateCollection={onSubmitCreateCollection}
        onSubmitCreateDocument={onSubmitCreateDocument}
        onUpdateCreateCollectionName={onUpdateCreateCollectionName}
        onUpdateCreateDocumentText={onUpdateCreateDocumentText}
      />,
    );
  }

  function renderWithQuitConfirmation(
    element: React.JSX.Element,
  ): React.JSX.Element {
    return element;
  }

  function handleQuitConfirmationSelect(
    action: QuitConfirmationAction,
  ): void {
    if (action === QuitConfirmationAction.Quit) {
      onConfirmQuitConfirmation();
      return;
    }

    onCancelQuitConfirmation();
  }
}
