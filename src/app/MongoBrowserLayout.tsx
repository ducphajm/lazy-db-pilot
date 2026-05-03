import {Box, Text} from 'ink';
import {Spinner, StatusMessage} from '@inkjs/ui';
import type {ReactNode} from 'react';
import type {MongoCollectionDocument} from '../mongodb/service.js';
import {DocumentCardList} from '../tui/DocumentCardList.js';
import {AppPhase} from './phases.js';
import {Screen} from './ui.js';
import {
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';

export type MongoBrowserLayoutProps = {
  readonly activeContainer: MongoBrowserContainer;
  readonly collectionDocuments: readonly MongoCollectionDocument[];
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedCollection: string | null;
  readonly selectedDocumentIndex: number;
  readonly selectedSidebarIndex: number;
  readonly sidebarItems: readonly MongoBrowserSidebarItem[];
};

export function MongoBrowserLayout({
  activeContainer,
  collectionDocuments,
  operationError,
  phase,
  selectedCollection,
  selectedDocumentIndex,
  selectedSidebarIndex,
  sidebarItems,
}: MongoBrowserLayoutProps): React.JSX.Element {
  return (
    <Screen>
      <StatusMessage variant="success">Databases loaded.</StatusMessage>
      <Box gap={1}>
        <BrowserPane
          isFocused={activeContainer === MongoBrowserContainer.LeftSidebar}
          title="Databases"
          width={32}
        >
          {sidebarItems.map((item, index) => (
            <SidebarItem
              isFocused={
                activeContainer === MongoBrowserContainer.LeftSidebar &&
                index === selectedSidebarIndex
              }
              item={item}
              key={item.key}
            />
          ))}
          <SidebarFeedback phase={phase} />
        </BrowserPane>
        <BrowserPane
          isFocused={activeContainer === MongoBrowserContainer.RightData}
          title="Documents"
        >
          <RightDataContent
            collectionDocuments={collectionDocuments}
            isFocused={activeContainer === MongoBrowserContainer.RightData}
            operationError={operationError}
            phase={phase}
            selectedCollection={selectedCollection}
            selectedDocumentIndex={selectedDocumentIndex}
          />
        </BrowserPane>
      </Box>
      <Text dimColor>
        Ctrl+h/Ctrl+l move focus, j/k move items, Enter/l open, q exits.
      </Text>
    </Screen>
  );
}

function BrowserPane({
  children,
  isFocused,
  title,
  width,
}: {
  readonly children: ReactNode;
  readonly isFocused: boolean;
  readonly title: string;
  readonly width?: number;
}): React.JSX.Element {
  return (
    <Box
      borderColor={isFocused ? 'cyan' : 'gray'}
      borderStyle="single"
      flexDirection="column"
      paddingX={1}
      width={width}
    >
      <Text color={isFocused ? 'cyan' : undefined}>{title}</Text>
      {children}
    </Box>
  );
}

function SidebarItem({
  isFocused,
  item,
}: {
  readonly isFocused: boolean;
  readonly item: MongoBrowserSidebarItem;
}): React.JSX.Element {
  const color =
    item.type === MongoBrowserSidebarItemType.Collection ? 'green' : undefined;

  return (
    <Text color={isFocused ? 'cyan' : color}>
      {isFocused ? '>' : ' '} {item.label}
    </Text>
  );
}

function SidebarFeedback({
  phase,
}: {
  readonly phase: AppPhase;
}): React.JSX.Element | null {
  if (phase === AppPhase.LoadingCollections) {
    return <Spinner label="Loading collections" />;
  }

  if (phase === AppPhase.CollectionsEmpty) {
    return <Text dimColor>  No collections found.</Text>;
  }

  if (phase === AppPhase.CollectionError) {
    return (
      <StatusMessage variant="error">Unable to load collections.</StatusMessage>
    );
  }

  return null;
}

function RightDataContent({
  collectionDocuments,
  isFocused,
  operationError,
  phase,
  selectedCollection,
  selectedDocumentIndex,
}: {
  readonly collectionDocuments: readonly MongoCollectionDocument[];
  readonly isFocused: boolean;
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedCollection: string | null;
  readonly selectedDocumentIndex: number;
}): React.JSX.Element {
  if (phase === AppPhase.LoadingCollectionData) {
    return (
      <Spinner label={`Loading documents from ${selectedCollection ?? 'collection'}`} />
    );
  }

  if (phase === AppPhase.CollectionDataError) {
    return (
      <StatusMessage variant="error">
        {operationError ?? 'Unable to load documents from the selected collection.'}
      </StatusMessage>
    );
  }

  if (phase === AppPhase.CollectionDataEmpty) {
    return (
      <StatusMessage variant="warning">
        No documents found in {selectedCollection ?? 'collection'}.
      </StatusMessage>
    );
  }

  if (phase === AppPhase.CollectionDataLoaded) {
    return (
      <DocumentCardList
        documents={collectionDocuments}
        isFocused={isFocused}
        selectedIndex={selectedDocumentIndex}
      />
    );
  }

  return <Text dimColor>Select a collection.</Text>;
}
