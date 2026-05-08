import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {MongoBrowserContainer} from './mongodbBrowser.js';
import {AppPhase} from './phases.js';
import {useAppInput} from './useAppInput.js';

afterEach(() => {
  cleanup();
});

describe('useAppInput', () => {
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
      delta: 1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(2, {
      delta: -1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(3, {
      delta: 1,
      visibleRowCount: undefined,
    });
    expect(moveDocumentCursor).toHaveBeenNthCalledWith(4, {
      delta: -1,
      visibleRowCount: undefined,
    });
  });
});

function InputHarness({
  moveDocumentCursor,
}: {
  readonly moveDocumentCursor: (input: {
    readonly delta: number;
    readonly visibleRowCount: number | undefined;
  }) => void;
}): React.JSX.Element {
  useAppInput({
    activeBrowserContainer: MongoBrowserContainer.RightData,
    browserSidebarItems: [],
    canMoveDocumentCursor: true,
    closeActiveDocumentTab: () => {},
    closeDatabaseFolder: () => {},
    exitApp: () => {},
    focusLeftSidebar: () => {},
    hasOpenDocumentTabs: true,
    moveActiveDocumentTab: () => {},
    moveDocumentCursor,
    phase: AppPhase.CollectionDataLoaded,
    selectedSidebarIndex: 0,
    selectCollection: () => {},
    selectDatabase: () => {},
    setActiveBrowserContainer: () => {},
    setSelectedSidebarIndex: () => {},
    showConnectionList: () => {},
  });

  return <></>;
}
