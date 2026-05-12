import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {DocumentCursorCommand, type MoveDocumentCursorInput} from './documentTabs.js';
import {
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';
import {AppPhase} from './phases.js';
import {useAppInput} from './useAppInput.js';

afterEach(() => {
  cleanup();
});

describe('useAppInput', () => {
  it('opens quit confirmation with q', () => {
    const requestQuitConfirmation = vi.fn();
    const instance = render(
      <InputHarness requestQuitConfirmation={requestQuitConfirmation} />,
    );

    instance.stdin.write('q');

    expect(requestQuitConfirmation).toHaveBeenCalledTimes(1);
  });

  it('confirms and cancels pending quit confirmation', () => {
    const cancelQuitConfirmation = vi.fn();
    const confirmQuitConfirmation = vi.fn();
    const instance = render(
      <InputHarness
        cancelQuitConfirmation={cancelQuitConfirmation}
        confirmQuitConfirmation={confirmQuitConfirmation}
        isQuitConfirmationPending
      />,
    );

    instance.stdin.write('n');
    instance.stdin.write('y');

    expect(cancelQuitConfirmation).toHaveBeenCalledTimes(1);
    expect(confirmQuitConfirmation).toHaveBeenCalledTimes(1);
  });

  it('ignores Ctrl+C without exiting or opening confirmation', () => {
    const requestQuitConfirmation = vi.fn();
    const instance = render(
      <InputHarness requestQuitConfirmation={requestQuitConfirmation} />,
    );

    instance.stdin.write('\x03');

    expect(requestQuitConfirmation).not.toHaveBeenCalled();
  });

  it('moves the right document cursor with j, k, Ctrl+d, and Ctrl+u', () => {
    const moveDocumentCursor = vi.fn();
    const instance = render(
      <InputHarness moveDocumentCursor={moveDocumentCursor} />,
    );

    instance.stdin.write('j');
    instance.stdin.write('k');
    instance.stdin.write('\x04');
    instance.stdin.write('\x15');

    expect(moveDocumentCursor).toHaveBeenNthCalledWith(1, {
      command: DocumentCursorCommand.MoveRelative,
      delta: 1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(2, {
      command: DocumentCursorCommand.MoveRelative,
      delta: -1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(3, {
      command: DocumentCursorCommand.MoveRelative,
      delta: 1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(4, {
      command: DocumentCursorCommand.MoveRelative,
      delta: -1,
      visibleRowCount: undefined,
    });
  });

  it('moves the right document cursor to the top with gg', () => {
    const moveDocumentCursor = vi.fn();
    const instance = render(
      <InputHarness moveDocumentCursor={moveDocumentCursor} />,
    );

    instance.stdin.write('g');
    instance.stdin.write('g');

    expect(moveDocumentCursor).toHaveBeenCalledTimes(1);
    expect(moveDocumentCursor).toHaveBeenCalledWith({
      command: DocumentCursorCommand.JumpToTop,
      visibleRowCount: undefined,
    });
  });

  it('moves the right document cursor to the bottom with G', () => {
    const moveDocumentCursor = vi.fn();
    const instance = render(
      <InputHarness moveDocumentCursor={moveDocumentCursor} />,
    );

    instance.stdin.write('G');

    expect(moveDocumentCursor).toHaveBeenCalledTimes(1);
    expect(moveDocumentCursor).toHaveBeenCalledWith({
      command: DocumentCursorCommand.JumpToBottom,
      visibleRowCount: undefined,
    });
  });

  it('clears pending g before handling unrelated right container input', () => {
    const moveDocumentCursor = vi.fn();
    const instance = render(
      <InputHarness moveDocumentCursor={moveDocumentCursor} />,
    );

    instance.stdin.write('g');
    instance.stdin.write('j');
    instance.stdin.write('g');

    expect(moveDocumentCursor).toHaveBeenCalledTimes(1);
    expect(moveDocumentCursor).toHaveBeenCalledWith({
      command: DocumentCursorCommand.MoveRelative,
      delta: 1,
      visibleRowCount: undefined,
    });
  });

  it('starts document creation with a when a document tab is open', () => {
    const startCreateDocument = vi.fn();
    const instance = render(
      <InputHarness startCreateDocument={startCreateDocument} />,
    );

    instance.stdin.write('a');

    expect(startCreateDocument).toHaveBeenCalledTimes(1);
  });

  it('ignores a when no document tab is open', () => {
    const startCreateDocument = vi.fn();
    const instance = render(
      <InputHarness
        hasOpenDocumentTabs={false}
        startCreateDocument={startCreateDocument}
      />,
    );

    instance.stdin.write('a');

    expect(startCreateDocument).not.toHaveBeenCalled();
  });

  it('starts collection creation with a from a focused database row', () => {
    const startCreateCollection = vi.fn();
    const instance = render(
      <InputHarness
        activeBrowserContainer={MongoBrowserContainer.LeftSidebar}
        browserSidebarItems={[databaseSidebarItem('admin')]}
        startCreateCollection={startCreateCollection}
      />,
    );

    instance.stdin.write('a');

    expect(startCreateCollection).toHaveBeenCalledWith('admin');
  });

  it('ignores collection creation with a from a focused collection row', () => {
    const startCreateCollection = vi.fn();
    const instance = render(
      <InputHarness
        activeBrowserContainer={MongoBrowserContainer.LeftSidebar}
        browserSidebarItems={[collectionSidebarItem('admin', 'users')]}
        startCreateCollection={startCreateCollection}
      />,
    );

    instance.stdin.write('a');

    expect(startCreateCollection).not.toHaveBeenCalled();
  });
});

function InputHarness({
  activeBrowserContainer = MongoBrowserContainer.RightData,
  browserSidebarItems = [],
  cancelQuitConfirmation = () => {},
  confirmQuitConfirmation = () => {},
  hasOpenDocumentTabs = true,
  isQuitConfirmationPending = false,
  moveDocumentCursor = () => {},
  requestQuitConfirmation = () => {},
  startCreateCollection = () => {},
  startCreateDocument = () => {},
}: {
  readonly activeBrowserContainer?: MongoBrowserContainer;
  readonly browserSidebarItems?: readonly MongoBrowserSidebarItem[];
  readonly hasOpenDocumentTabs?: boolean;
  readonly cancelQuitConfirmation?: () => void;
  readonly confirmQuitConfirmation?: () => void;
  readonly isQuitConfirmationPending?: boolean;
  readonly moveDocumentCursor?: (input: MoveDocumentCursorInput) => void;
  readonly requestQuitConfirmation?: () => void;
  readonly startCreateCollection?: (databaseName: string) => void;
  readonly startCreateDocument?: () => void;
}): React.JSX.Element {
  useAppInput({
    activeBrowserContainer,
    browserSidebarItems,
    canMoveDocumentCursor: true,
    cancelCreateCollection: () => {},
    cancelCreateDocument: () => {},
    closeActiveDocumentTab: () => {},
    closeDatabaseFolder: () => {},
    confirmQuitConfirmation,
    focusLeftSidebar: () => {},
    hasOpenDocumentTabs,
    isCreateCollectionDraftActive: false,
    isCreateDocumentDraftActive: false,
    isQuitConfirmationPending,
    moveActiveDocumentTab: () => {},
    moveDocumentCursor,
    phase: AppPhase.CollectionDataLoaded,
    startCreateCollection,
    startCreateDocument,
    selectedSidebarIndex: 0,
    selectCollection: () => {},
    selectDatabase: () => {},
    setActiveBrowserContainer: () => {},
    setSelectedSidebarIndex: () => {},
    cancelQuitConfirmation,
    requestQuitConfirmation,
    showConnectionList: () => {},
  });

  return <></>;
}

function databaseSidebarItem(databaseName: string): MongoBrowserSidebarItem {
  return {
    databaseName,
    key: `database:${databaseName}`,
    label: `[+] ${databaseName}`,
    type: MongoBrowserSidebarItemType.Database,
  };
}

function collectionSidebarItem(
  databaseName: string,
  collectionName: string,
): MongoBrowserSidebarItem {
  return {
    collectionName,
    databaseName,
    key: `collection:${databaseName}:${collectionName}`,
    label: `  - ${collectionName}`,
    type: MongoBrowserSidebarItemType.Collection,
  };
}
