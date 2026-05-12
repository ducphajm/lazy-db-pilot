import {Box, Text, useInput, useStdout} from 'ink';
import {Spinner, StatusMessage} from '@inkjs/ui';
import {memo} from 'react';
import type {SetStateAction} from 'react';
import type {CreateDocumentDraft} from './createDocument.js';
import type {CreateCollectionDraft} from './createCollection.js';
import type {CollectionDocumentTab} from './documentTabs.js';
import {BrowserPane, MemoizedRightBrowserPane} from './DocumentsPane.js';
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
  readonly createCollectionDraft: CreateCollectionDraft | null;
  readonly createDocumentDraft: CreateDocumentDraft | null;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly leftPaneWidth?: number;
  readonly operationError: string | null;
  readonly phase: AppPhase;
  readonly selectedSidebarIndex: number;
  readonly sidebarItems: readonly MongoBrowserSidebarItem[];
  readonly onCancelCreateCollection: () => void;
  readonly onCancelCreateDocument: () => void;
  readonly onSubmitCreateCollection: () => void;
  readonly onSubmitCreateDocument: () => void;
  readonly onUpdateCreateCollectionName: (text: SetStateAction<string>) => void;
  readonly onUpdateCreateDocumentText: (text: SetStateAction<string>) => void;
};

export function MongoBrowserLayout({
  activeContainer,
  activeDocumentTab,
  createCollectionDraft,
  createDocumentDraft,
  documentTabs,
  leftPaneWidth = defaultLeftBrowserPaneWidth,
  operationError,
  phase,
  selectedSidebarIndex,
  sidebarItems,
  onCancelCreateCollection,
  onCancelCreateDocument,
  onSubmitCreateCollection,
  onSubmitCreateDocument,
  onUpdateCreateCollectionName,
  onUpdateCreateDocumentText,
}: MongoBrowserLayoutProps): React.JSX.Element {
  const {stdout} = useStdout();
  const browserHeight = getBrowserContentHeight(stdout.rows);
  const visibleDocumentRowCount = getVisibleDocumentRowCount(browserHeight);

  return (
    <Screen>
      <StatusMessage variant="success">Databases loaded.</StatusMessage>
      <Box alignItems="flex-start" gap={1} height={browserHeight}>
        <MemoizedLeftBrowserPane
          activeContainer={activeContainer}
          paneWidth={leftPaneWidth}
          paneHeight={browserHeight}
          phase={phase}
          createCollectionDraft={createCollectionDraft}
          selectedSidebarIndex={selectedSidebarIndex}
          sidebarItems={sidebarItems}
          onCancelCreateCollection={onCancelCreateCollection}
          onSubmitCreateCollection={onSubmitCreateCollection}
          onUpdateCreateCollectionName={onUpdateCreateCollectionName}
        />
        <MemoizedRightBrowserPane
          activeContainer={activeContainer}
          activeDocumentTab={activeDocumentTab}
          createDocumentDraft={createDocumentDraft}
          documentTabs={documentTabs}
          operationError={operationError}
          visibleDocumentRowCount={visibleDocumentRowCount}
          onCancelCreateDocument={onCancelCreateDocument}
          onSubmitCreateDocument={onSubmitCreateDocument}
          onUpdateCreateDocumentText={onUpdateCreateDocumentText}
        />
      </Box>
      <Text dimColor>
        Ctrl+h/Ctrl+l move focus, j/k move items, Enter/l open, Tab/Shift+Tab move tabs, x closes tab, q asks to quit.
      </Text>
    </Screen>
  );
}

const MemoizedLeftBrowserPane = memo(LeftBrowserPane);

function LeftBrowserPane({
  activeContainer,
  paneWidth,
  paneHeight,
  phase,
  createCollectionDraft,
  selectedSidebarIndex,
  sidebarItems,
  onCancelCreateCollection,
  onSubmitCreateCollection,
  onUpdateCreateCollectionName,
}: {
  readonly activeContainer: MongoBrowserContainer;
  readonly paneWidth: number;
  readonly paneHeight: number | undefined;
  readonly phase: AppPhase;
  readonly createCollectionDraft: CreateCollectionDraft | null;
  readonly selectedSidebarIndex: number;
  readonly sidebarItems: readonly MongoBrowserSidebarItem[];
  readonly onCancelCreateCollection: () => void;
  readonly onSubmitCreateCollection: () => void;
  readonly onUpdateCreateCollectionName: (text: SetStateAction<string>) => void;
}): React.JSX.Element {
  const itemLabelWidth = getLeftSidebarItemLabelWidth(paneWidth);
  const visibleSidebarRowCount = getVisibleSidebarRowCount(paneHeight, phase);
  const visibleSidebarItems = getVisibleSidebarItems({
    items: sidebarItems,
    selectedIndex: selectedSidebarIndex,
    visibleRowCount: visibleSidebarRowCount,
  });
  const firstVisibleSidebarIndex =
    visibleSidebarRowCount === undefined
      ? 0
      : getFirstVisibleSidebarIndex({
          itemCount: sidebarItems.length,
          selectedIndex: selectedSidebarIndex,
          visibleRowCount: visibleSidebarRowCount,
        });

  return (
    <BrowserPane
      isFocused={activeContainer === MongoBrowserContainer.LeftSidebar}
      title="Databases"
      width={paneWidth}
    >
      <Box
        flexDirection="column"
        height={visibleSidebarRowCount}
        overflowY="hidden"
      >
        {visibleSidebarItems.map((item, index) => (
          <MemoizedSidebarItem
            isFocused={
              activeContainer === MongoBrowserContainer.LeftSidebar &&
              firstVisibleSidebarIndex + index === selectedSidebarIndex
            }
            labelWidth={itemLabelWidth}
            item={item}
            key={item.key}
          />
        ))}
      </Box>
      <SidebarFeedback phase={phase} />
      {createCollectionDraft === null ? null : (
        <CreateCollectionEditor
          draft={createCollectionDraft}
          onCancel={onCancelCreateCollection}
          onSubmit={onSubmitCreateCollection}
          onUpdateName={onUpdateCreateCollectionName}
        />
      )}
    </BrowserPane>
  );
}

const MemoizedSidebarItem = memo(SidebarItem);

function SidebarItem({
  isFocused,
  item,
  labelWidth,
}: {
  readonly isFocused: boolean;
  readonly item: MongoBrowserSidebarItem;
  readonly labelWidth: number;
}): React.JSX.Element {
  const color =
    item.type === MongoBrowserSidebarItemType.Collection ? 'green' : undefined;
  const label =
    item.type === MongoBrowserSidebarItemType.Collection
      ? getCollectionSidebarLabel(item.collectionName, labelWidth)
      : item.label;
  const wrap =
    item.type === MongoBrowserSidebarItemType.Collection
      ? 'truncate-end'
      : 'wrap';

  return (
    <Text color={isFocused ? 'cyan' : color} wrap={wrap}>
      {isFocused ? '>' : ' '} {label}
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

function CreateCollectionEditor({
  draft,
  onCancel,
  onSubmit,
  onUpdateName,
}: {
  readonly draft: CreateCollectionDraft;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
  readonly onUpdateName: (text: SetStateAction<string>) => void;
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
      onUpdateName(name => name.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input.length > 0) {
      onUpdateName(name => `${name}${input}`);
    }
  });

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="cyan">New collection: {draft.databaseName}</Text>
      {draft.error === null ? null : (
        <StatusMessage variant="error">{draft.error}</StatusMessage>
      )}
      {draft.isSubmitting ? (
        <Spinner label="Creating collection" />
      ) : (
        <Text>{`> ${draft.name}`}</Text>
      )}
      <Text dimColor>Enter submits, Escape cancels.</Text>
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

export function getCollectionSidebarLabel(
  collectionName: string,
  labelWidth: number,
): string {
  const availableCollectionNameWidth = Math.max(
    0,
    labelWidth - collectionLabelPrefix.length,
  );

  return `${collectionLabelPrefix}${ellipsizeSidebarLabel(
    collectionName,
    availableCollectionNameWidth,
  )}`;
}

export function ellipsizeSidebarLabel(
  label: string,
  maxWidth: number,
): string {
  if (maxWidth <= 0) {
    return '';
  }

  if (label.length <= maxWidth) {
    return label;
  }

  if (maxWidth <= ellipsisSuffix.length) {
    return ellipsisSuffix.slice(0, maxWidth);
  }

  return `${label.slice(0, maxWidth - ellipsisSuffix.length)}${ellipsisSuffix}`;
}

export function getLeftSidebarItemLabelWidth(paneWidth: number): number {
  return Math.max(
    0,
    paneWidth - browserPaneHorizontalChromeColumns - sidebarFocusMarkerColumns,
  );
}

export function getVisibleSidebarRowCount(
  paneHeight: number | undefined,
  phase: AppPhase,
): number | undefined {
  if (paneHeight === undefined) {
    return undefined;
  }

  return Math.max(
    0,
    paneHeight -
      browserPaneVerticalChromeRows -
      browserPaneTitleRows -
      getSidebarFeedbackRowCount(phase),
  );
}

export function getVisibleDocumentRowCount(
  paneHeight: number | undefined,
): number | undefined {
  if (paneHeight === undefined) {
    return undefined;
  }

  return Math.max(
    0,
    paneHeight -
      browserPaneVerticalChromeRows -
      browserPaneTitleRows -
      documentTabStripRows,
  );
}

export function getVisibleSidebarItems({
  items,
  selectedIndex,
  visibleRowCount,
}: {
  readonly items: readonly MongoBrowserSidebarItem[];
  readonly selectedIndex: number;
  readonly visibleRowCount: number | undefined;
}): readonly MongoBrowserSidebarItem[] {
  if (visibleRowCount === undefined) {
    return items;
  }

  if (visibleRowCount <= 0) {
    return [];
  }

  const firstVisibleIndex = getFirstVisibleSidebarIndex({
    itemCount: items.length,
    selectedIndex,
    visibleRowCount,
  });

  return items.slice(firstVisibleIndex, firstVisibleIndex + visibleRowCount);
}

export function getFirstVisibleSidebarIndex({
  itemCount,
  selectedIndex,
  visibleRowCount,
}: {
  readonly itemCount: number;
  readonly selectedIndex: number;
  readonly visibleRowCount: number;
}): number {
  if (itemCount === 0 || visibleRowCount <= 0) {
    return 0;
  }

  const clampedSelectedIndex = Math.min(
    Math.max(0, selectedIndex),
    itemCount - 1,
  );
  const lastFirstVisibleIndex = Math.max(0, itemCount - visibleRowCount);

  return Math.min(
    Math.max(0, clampedSelectedIndex - visibleRowCount + 1),
    lastFirstVisibleIndex,
  );
}

export const defaultLeftBrowserPaneWidth = 32;

const browserPaneHorizontalChromeColumns = 4;
const browserPaneTitleRows = 1;
const browserPaneVerticalChromeRows = 2;
const collectionLabelPrefix = '  - ';
const documentTabStripRows = 1;
const ellipsisSuffix = '...';
const sidebarFocusMarkerColumns = 2;

function getSidebarFeedbackRowCount(phase: AppPhase): number {
  if (
    phase === AppPhase.LoadingCollections ||
    phase === AppPhase.CollectionsEmpty ||
    phase === AppPhase.CollectionError
  ) {
    return 1;
  }

  return 0;
}
