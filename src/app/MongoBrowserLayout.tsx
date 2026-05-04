import {Box, Text, useStdout} from 'ink';
import {Spinner, StatusMessage} from '@inkjs/ui';
import {memo} from 'react';
import type {ReactNode} from 'react';
import {DocumentCardList} from '../tui/DocumentCardList.js';
import {
  CollectionDocumentTabStatus,
  type CollectionDocumentTab,
} from './documentTabs.js';
import {AppPhase} from './phases.js';
import {Screen} from './ui.js';
import {
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';

export type MongoBrowserLayoutProps = {
  readonly activeContainer: MongoBrowserContainer;
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedSidebarIndex: number;
  readonly sidebarItems: readonly MongoBrowserSidebarItem[];
};

export function MongoBrowserLayout({
  activeContainer,
  activeDocumentTab,
  documentTabs,
  operationError,
  phase,
  selectedSidebarIndex,
  sidebarItems,
}: MongoBrowserLayoutProps): React.JSX.Element {
  const {stdout} = useStdout();
  const browserHeight = getBrowserContentHeight(stdout.rows);

  return (
    <Screen>
      <StatusMessage variant="success">Databases loaded.</StatusMessage>
      <Box alignItems="flex-start" gap={1} height={browserHeight}>
        <MemoizedLeftBrowserPane
          activeContainer={activeContainer}
          phase={phase}
          selectedSidebarIndex={selectedSidebarIndex}
          sidebarItems={sidebarItems}
        />
        <MemoizedRightBrowserPane
          activeContainer={activeContainer}
          activeDocumentTab={activeDocumentTab}
          documentTabs={documentTabs}
          operationError={operationError}
        />
      </Box>
      <Text dimColor>
        Ctrl+h/Ctrl+l move focus, j/k move items, Enter/l open, Tab/Shift+Tab move tabs, x closes tab, q exits.
      </Text>
    </Screen>
  );
}

const MemoizedLeftBrowserPane = memo(LeftBrowserPane);

function LeftBrowserPane({
  activeContainer,
  phase,
  selectedSidebarIndex,
  sidebarItems,
}: {
  readonly activeContainer: MongoBrowserContainer;
  readonly phase: AppPhase;
  readonly selectedSidebarIndex: number;
  readonly sidebarItems: readonly MongoBrowserSidebarItem[];
}): React.JSX.Element {
  return (
    <BrowserPane
      isFocused={activeContainer === MongoBrowserContainer.LeftSidebar}
      title="Databases"
      width={32}
    >
      {sidebarItems.map((item, index) => (
        <MemoizedSidebarItem
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
  );
}

const MemoizedRightBrowserPane = memo(RightBrowserPane);

function RightBrowserPane({
  activeContainer,
  activeDocumentTab,
  documentTabs,
  operationError,
}: {
  readonly activeContainer: MongoBrowserContainer;
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly operationError: string | null;
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
      <Box flexDirection="column" flexShrink={1} overflowY="hidden">
        <RightDataContent
          activeDocumentTab={activeDocumentTab}
          isFocused={activeContainer === MongoBrowserContainer.RightData}
          operationError={operationError}
        />
      </Box>
    </BrowserPane>
  );
}

function BrowserPane({
  children,
  flexGrow,
  flexShrink,
  isFocused,
  title,
  width,
}: {
  readonly children: ReactNode;
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
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      flexDirection="column"
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

const MemoizedSidebarItem = memo(SidebarItem);

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
  activeDocumentTab,
  isFocused,
  operationError,
}: {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly isFocused: boolean;
  readonly operationError: string | null;
}): React.JSX.Element {
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

  if (activeDocumentTab.status === CollectionDocumentTabStatus.Loaded) {
    return (
      <DocumentCardList
        documents={activeDocumentTab.documents}
        isFocused={isFocused}
        selectedIndex={activeDocumentTab.selectedDocumentIndex}
      />
    );
  }

  return <Text dimColor>No open document tabs.</Text>;
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

export function getBrowserContentHeight(
  terminalRows: number | undefined,
): number | undefined {
  if (terminalRows === undefined || terminalRows <= 0) {
    return undefined;
  }

  return Math.max(5, terminalRows - browserVerticalChromeRows);
}

const browserVerticalChromeRows = 4;
