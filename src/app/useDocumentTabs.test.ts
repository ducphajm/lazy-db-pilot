import {describe, expect, it} from 'vitest';
import {CollectionDocumentTabStatus, DocumentCursorCommand} from './documentTabs.js';
import type {CollectionDocumentTab} from './documentTabs.js';
import {moveTabDocumentCursor} from './useDocumentTabs.js';

describe('moveTabDocumentCursor', () => {
  it('moves line by line and scrolls to keep the cursor visible', () => {
    const tab = documentTab({
      documents: [
        {
          _id: '1',
          field_0: 'zero',
          field_1: 'one',
          field_2: 'two',
          field_3: 'three',
        },
      ],
    });

    const nextTab = moveTabDocumentCursor({
      command: DocumentCursorCommand.MoveRelative,
      delta: 4,
      tab,
      visibleRowCount: 3,
    });

    expect(nextTab.cursorLineIndex).toBe(4);
    expect(nextTab.scrollOffset).toBe(3);
    expect(nextTab.selectedDocumentIndex).toBe(0);
  });

  it('selects the document containing the active cursor', () => {
    const tab = documentTab({
      documents: [
        {_id: '1', name: 'Ada'},
        {_id: '2', name: 'Grace'},
      ],
    });

    const nextTab = moveTabDocumentCursor({
      command: DocumentCursorCommand.MoveRelative,
      delta: 3,
      tab,
      visibleRowCount: 4,
    });

    expect(nextTab.cursorLineIndex).toBe(3);
    expect(nextTab.selectedDocumentIndex).toBe(1);
    expect(nextTab.scrollOffset).toBe(4);
  });

  it('clamps cursor movement at document content boundaries', () => {
    const tab = documentTab({
      cursorLineIndex: 1,
      documents: [{_id: '1', name: 'Ada'}],
    });

    expect(
      moveTabDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: -10,
        tab,
        visibleRowCount: 5,
      }).cursorLineIndex,
    ).toBe(0);
    expect(
      moveTabDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: 10,
        tab,
        visibleRowCount: 5,
      }).cursorLineIndex,
    ).toBe(1);
  });

  it('jumps to the top document cursor and scroll offset', () => {
    const tab = documentTab({
      cursorLineIndex: 3,
      documents: [
        {_id: '1', name: 'Ada'},
        {_id: '2', name: 'Grace'},
      ],
      scrollOffset: 4,
      selectedDocumentIndex: 1,
    });

    const nextTab = moveTabDocumentCursor({
      command: DocumentCursorCommand.JumpToTop,
      tab,
      visibleRowCount: 3,
    });

    expect(nextTab.cursorLineIndex).toBe(0);
    expect(nextTab.selectedDocumentIndex).toBe(0);
    expect(nextTab.scrollOffset).toBe(0);
  });

  it('jumps to the bottom document cursor and scroll offset', () => {
    const tab = documentTab({
      documents: [
        {_id: '1', name: 'Ada'},
        {_id: '2', name: 'Grace'},
      ],
    });

    const nextTab = moveTabDocumentCursor({
      command: DocumentCursorCommand.JumpToBottom,
      tab,
      visibleRowCount: 3,
    });

    expect(nextTab.cursorLineIndex).toBe(3);
    expect(nextTab.selectedDocumentIndex).toBe(1);
    expect(nextTab.scrollOffset).toBe(5);
  });
});

function documentTab({
  cursorLineIndex = 0,
  documents,
  scrollOffset = 0,
  selectedDocumentIndex = 0,
}: {
  readonly cursorLineIndex?: number;
  readonly documents: CollectionDocumentTab['documents'];
  readonly scrollOffset?: number;
  readonly selectedDocumentIndex?: number;
}): CollectionDocumentTab {
  return {
    collectionName: 'users',
    connectionName: 'Local Mongo',
    cursorLineIndex,
    databaseName: 'admin',
    documents,
    error: null,
    id: 'tab-id',
    scrollOffset,
    selectedDocumentIndex,
    status: CollectionDocumentTabStatus.Loaded,
  };
}
