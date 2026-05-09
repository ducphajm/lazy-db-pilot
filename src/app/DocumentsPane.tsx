import {Box, Text, useInput} from 'ink';
import {Spinner, StatusMessage} from '@inkjs/ui';
import {memo, type SetStateAction} from 'react';
import {DocumentCardList} from '../tui/DocumentCardList.js';
import type {CreateDocumentDraft} from './createDocument.js';
import {
  CollectionDocumentTabStatus,
  type CollectionDocumentTab,
} from './documentTabs.js';
import {MongoBrowserContainer} from './mongodbBrowser.js';

export const MemoizedRightBrowserPane = memo(RightBrowserPane);

function RightBrowserPane({
  activeContainer,
  activeDocumentTab,
  createDocumentDraft,
  documentTabs,
  operationError,
  visibleDocumentRowCount,
  onCancelCreateDocument,
  onSubmitCreateDocument,
  onUpdateCreateDocumentText,
}: {
  readonly activeContainer: MongoBrowserContainer;
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly createDocumentDraft: CreateDocumentDraft | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly operationError: string | null;
  readonly visibleDocumentRowCount: number | undefined;
  readonly onCancelCreateDocument: () => void;
  readonly onSubmitCreateDocument: () => void;
  readonly onUpdateCreateDocumentText: (text: SetStateAction<string>) => void;
}): React.JSX.Element {
  return (
    <BrowserPane
      flexGrow={1}
      flexShrink={1}
      isFocused={activeContainer === MongoBrowserContainer.RightData}
      title="Documents"
    >
      <DocumentTabStrip
        activeDocumentTab={activeDocumentTab}
        documentTabs={documentTabs}
      />
      <Box
        flexDirection="column"
        flexShrink={1}
        height={visibleDocumentRowCount}
        overflowY="hidden"
      >
        <RightDataContent
          activeDocumentTab={activeDocumentTab}
          createDocumentDraft={createDocumentDraft}
          isFocused={activeContainer === MongoBrowserContainer.RightData}
          operationError={operationError}
          visibleDocumentRowCount={visibleDocumentRowCount}
          onCancelCreateDocument={onCancelCreateDocument}
          onSubmitCreateDocument={onSubmitCreateDocument}
          onUpdateCreateDocumentText={onUpdateCreateDocumentText}
        />
      </Box>
    </BrowserPane>
  );
}

export function BrowserPane({
  children,
  flexGrow,
  flexShrink,
  isFocused,
  title,
  width,
}: {
  readonly children: React.ReactNode;
  readonly flexGrow?: number;
  readonly flexShrink?: number;
  readonly isFocused: boolean;
  readonly title: string;
  readonly width?: number;
}): React.JSX.Element {
  return (
    <Box
      borderColor={isFocused ? 'cyan' : 'gray'}
      borderStyle="single"
      flexDirection="column"
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      height="100%"
      minWidth={width}
      overflowY="hidden"
      paddingX={1}
      width={width}
    >
      <Text color={isFocused ? 'cyan' : undefined}>{title}</Text>
      {children}
    </Box>
  );
}

function RightDataContent({
  activeDocumentTab,
  createDocumentDraft,
  isFocused,
  operationError,
  visibleDocumentRowCount,
  onCancelCreateDocument,
  onSubmitCreateDocument,
  onUpdateCreateDocumentText,
}: {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly createDocumentDraft: CreateDocumentDraft | null;
  readonly isFocused: boolean;
  readonly operationError: string | null;
  readonly visibleDocumentRowCount: number | undefined;
  readonly onCancelCreateDocument: () => void;
  readonly onSubmitCreateDocument: () => void;
  readonly onUpdateCreateDocumentText: (text: SetStateAction<string>) => void;
}): React.JSX.Element {
  if (createDocumentDraft !== null) {
    return (
      <CreateDocumentEditor
        draft={createDocumentDraft}
        onCancel={onCancelCreateDocument}
        onSubmit={onSubmitCreateDocument}
        onUpdateText={onUpdateCreateDocumentText}
      />
    );
  }

  if (activeDocumentTab === null) {
    return <Text dimColor>No open document tabs.</Text>;
  }

  if (activeDocumentTab.status === CollectionDocumentTabStatus.Loading) {
    return (
      <Spinner label={`Loading documents from ${activeDocumentTab.collectionName}`} />
    );
  }

  if (activeDocumentTab.status === CollectionDocumentTabStatus.Error) {
    return (
      <StatusMessage variant="error">
        {activeDocumentTab.error ??
          operationError ??
          'Unable to load documents from the selected collection.'}
      </StatusMessage>
    );
  }

  if (activeDocumentTab.status === CollectionDocumentTabStatus.Empty) {
    return (
      <StatusMessage variant="warning">
        No documents found in {activeDocumentTab.collectionName}.
      </StatusMessage>
    );
  }

  return (
    <DocumentCardList
      cursorLineIndex={activeDocumentTab.cursorLineIndex}
      documents={activeDocumentTab.documents}
      isFocused={isFocused}
      scrollOffset={activeDocumentTab.scrollOffset}
      selectedIndex={activeDocumentTab.selectedDocumentIndex}
      visibleRowCount={visibleDocumentRowCount}
    />
  );
}

function CreateDocumentEditor({
  draft,
  onCancel,
  onSubmit,
  onUpdateText,
}: {
  readonly draft: CreateDocumentDraft;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  readonly onUpdateText: (text: SetStateAction<string>) => void;
}): React.JSX.Element {
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      onSubmit();
      return;
    }

    if (key.backspace || key.delete) {
      onUpdateText(text => text.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input.length > 0) {
      onUpdateText(text => `${text}${input}`);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color="cyan">
        New document: {draft.databaseName}.{draft.collectionName}
      </Text>
      {draft.error === null ? null : (
        <StatusMessage variant="error">{draft.error}</StatusMessage>
      )}
      {draft.isSubmitting ? (
        <Spinner label="Inserting document" />
      ) : (
        <Text>{`> ${draft.text}`}</Text>
      )}
      <Text dimColor>Enter submits, Escape cancels.</Text>
    </Box>
  );
}

function DocumentTabStrip({
  activeDocumentTab,
  documentTabs,
}: {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
}): React.JSX.Element {
  if (documentTabs.length === 0) {
    return <Text dimColor>Tabs: none</Text>;
  }

  return (
    <Box flexShrink={0} gap={1}>
      {documentTabs.map(tab => {
        const isActive = tab.id === activeDocumentTab?.id;
        const label = `${tab.databaseName}.${tab.collectionName}`;

        return (
          <Text color={isActive ? 'cyan' : undefined} key={tab.id}>
            {isActive ? '[' : ' '} {label} {isActive ? ']' : ' '}
          </Text>
        );
      })}
    </Box>
  );
}
