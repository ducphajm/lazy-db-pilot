import {useInput, useStdout} from 'ink';
import type {Dispatch, SetStateAction} from 'react';
import {DocumentTabMoveDirection} from './documentTabs.js';
import {
  getBrowserContentHeight,
  getVisibleDocumentRowCount,
} from './MongoBrowserLayout.js';
import {AppPhase} from './phases.js';
import {
  canFocusMongoBrowserRightData,
  isMongoBrowserPhase,
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
  moveSidebarIndex,
  type MongoBrowserSidebarItem,
} from './mongodbBrowser.js';

export type UseAppInputParams = {
  readonly activeBrowserContainer: MongoBrowserContainer;
  readonly browserSidebarItems: readonly MongoBrowserSidebarItem[];
  readonly canMoveDocumentCursor: boolean;
  readonly closeActiveDocumentTab: () => void;
  readonly closeDatabaseFolder: (databaseName: string) => void;
  readonly exitApp: () => void;
  readonly focusLeftSidebar: () => void;
  readonly hasOpenDocumentTabs: boolean;
  readonly moveActiveDocumentTab: (
    direction: DocumentTabMoveDirection,
  ) => void;
  readonly moveDocumentCursor: (input: {
    readonly delta: number;
    readonly visibleRowCount: number | undefined;
  }) => void;
  readonly phase: AppPhase;
  readonly selectedSidebarIndex: number;
  readonly selectCollection: (collection: {
    readonly collectionName: string;
    readonly databaseName: string;
  }) => void;
  readonly selectDatabase: (databaseName: string) => void;
  readonly setActiveBrowserContainer: Dispatch<
    SetStateAction<MongoBrowserContainer>
  >;
  readonly setSelectedSidebarIndex: Dispatch<SetStateAction<number>>;
  readonly showConnectionList: () => void;
};

export function useAppInput({
  activeBrowserContainer,
  browserSidebarItems,
  canMoveDocumentCursor,
  closeActiveDocumentTab,
  closeDatabaseFolder,
  exitApp,
  focusLeftSidebar,
  hasOpenDocumentTabs,
  moveActiveDocumentTab,
  moveDocumentCursor,
  phase,
  selectedSidebarIndex,
  selectCollection,
  selectDatabase,
  setActiveBrowserContainer,
  setSelectedSidebarIndex,
  showConnectionList,
}: UseAppInputParams): void {
  const {stdout} = useStdout();
  const focusedSidebarItem = browserSidebarItems[selectedSidebarIndex];
  const visibleDocumentRowCount = getVisibleDocumentRowCount(
    getBrowserContentHeight(stdout.rows),
  );

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exitApp();
      return;
    }

    if (input === 'q' && phase !== AppPhase.CreatingConnection) {
      exitApp();
      return;
    }

    if (!isMongoBrowserPhase(phase)) {
      return;
    }

    if (key.ctrl && input === 'h') {
      focusLeftSidebar();
      return;
    }

    if (
      key.ctrl &&
      input === 'l' &&
      (hasOpenDocumentTabs || canFocusMongoBrowserRightData(phase))
    ) {
      setActiveBrowserContainer(MongoBrowserContainer.RightData);
      return;
    }

    if (key.ctrl && (input === 'j' || input === 'k')) {
      return;
    }

    if (activeBrowserContainer === MongoBrowserContainer.RightData) {
      handleRightContainerInput(input, key.backspace, key.ctrl, key.shift, key.tab);
      return;
    }

    handleLeftSidebarInput(input, key.return, key.backspace);
  });

  function handleRightContainerInput(
    input: string,
    isBackspace: boolean,
    isCtrl: boolean,
    isShift: boolean,
    isTab: boolean,
  ): void {
    if (hasOpenDocumentTabs && isTab) {
      moveActiveDocumentTab(
        isShift
          ? DocumentTabMoveDirection.Backward
          : DocumentTabMoveDirection.Forward,
      );
      return;
    }

    if (input === 'h' || isBackspace) {
      focusLeftSidebar();
      return;
    }

    if (input === 'x' && hasOpenDocumentTabs) {
      closeActiveDocumentTab();
      return;
    }

    if (canMoveDocumentCursor && isCtrl && input === 'd') {
      moveDocumentCursor({
        delta: getDocumentPageMoveDelta(visibleDocumentRowCount),
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && isCtrl && input === 'u') {
      moveDocumentCursor({
        delta: -getDocumentPageMoveDelta(visibleDocumentRowCount),
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && input === 'j') {
      moveDocumentCursor({delta: 1, visibleRowCount: visibleDocumentRowCount});
      return;
    }

    if (canMoveDocumentCursor && input === 'k') {
      moveDocumentCursor({delta: -1, visibleRowCount: visibleDocumentRowCount});
    }
  }

  function handleLeftSidebarInput(
    input: string,
    isReturn: boolean,
    isBackspace: boolean,
  ): void {
    if (isBackspace) {
      showConnectionList();
      return;
    }

    if (input === 'j' || input === 'k') {
      setSelectedSidebarIndex(index =>
        moveSidebarIndex({
          currentIndex: index,
          direction: input === 'j' ? 1 : -1,
          itemCount: browserSidebarItems.length,
        }),
      );
      return;
    }

    if (input === 'h') {
      if (focusedSidebarItem?.type === MongoBrowserSidebarItemType.Database) {
        closeDatabaseFolder(focusedSidebarItem.databaseName);
      }

      return;
    }

    if (
      focusedSidebarItem?.type === MongoBrowserSidebarItemType.Database &&
      (input === 'l' || isReturn)
    ) {
      selectDatabase(focusedSidebarItem.databaseName);
      return;
    }

    if (
      focusedSidebarItem?.type === MongoBrowserSidebarItemType.Collection &&
      (input === 'l' || isReturn)
    ) {
      selectCollection({
        collectionName: focusedSidebarItem.collectionName,
        databaseName: focusedSidebarItem.databaseName,
      });
    }
  }
}

function getDocumentPageMoveDelta(
  visibleRowCount: number | undefined,
): number {
  return Math.max(1, Math.floor((visibleRowCount ?? 1) / 2));
}
