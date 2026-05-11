import {useInput, useStdout} from 'ink';
import {useRef, type Dispatch, type SetStateAction} from 'react';
import {
  DocumentCursorCommand,
  DocumentTabMoveDirection,
  type MoveDocumentCursorInput,
} from './documentTabs.js';
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
  readonly cancelCreateDocument: () => void;
  readonly closeActiveDocumentTab: () => void;
  readonly closeDatabaseFolder: (databaseName: string) => void;
  readonly confirmQuitConfirmation: () => void;
  readonly focusLeftSidebar: () => void;
  readonly hasOpenDocumentTabs: boolean;
  readonly isCreateDocumentDraftActive: boolean;
  readonly isQuitConfirmationPending: boolean;
  readonly moveActiveDocumentTab: (
    direction: DocumentTabMoveDirection,
  ) => void;
  readonly moveDocumentCursor: (input: MoveDocumentCursorInput) => void;
  readonly phase: AppPhase;
  readonly startCreateDocument: () => void;
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
  readonly cancelQuitConfirmation: () => void;
  readonly requestQuitConfirmation: () => void;
  readonly showConnectionList: () => void;
};

export function useAppInput({
  activeBrowserContainer,
  browserSidebarItems,
  canMoveDocumentCursor,
  cancelCreateDocument,
  closeActiveDocumentTab,
  closeDatabaseFolder,
  confirmQuitConfirmation,
  focusLeftSidebar,
  hasOpenDocumentTabs,
  isCreateDocumentDraftActive,
  isQuitConfirmationPending,
  moveActiveDocumentTab,
  moveDocumentCursor,
  phase,
  startCreateDocument,
  selectedSidebarIndex,
  selectCollection,
  selectDatabase,
  setActiveBrowserContainer,
  setSelectedSidebarIndex,
  cancelQuitConfirmation,
  requestQuitConfirmation,
  showConnectionList,
}: UseAppInputParams): void {
  const {stdout} = useStdout();
  const focusedSidebarItem = browserSidebarItems[selectedSidebarIndex];
  const hasPendingRightContainerGInput = useRef(false);
  const visibleDocumentRowCount = getVisibleDocumentRowCount(
    getBrowserContentHeight(stdout.rows),
  );

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      return;
    }

    if (isQuitConfirmationPending) {
      if (input === 'y') {
        confirmQuitConfirmation();
        return;
      }

      if (input === 'n' || key.escape) {
        cancelQuitConfirmation();
      }

      return;
    }

    if (input === 'q' && phase !== AppPhase.CreatingConnection) {
      requestQuitConfirmation();
      return;
    }

    if (!isMongoBrowserPhase(phase)) {
      return;
    }

    if (isCreateDocumentDraftActive) {
      if (key.escape) {
        cancelCreateDocument();
      }

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

    hasPendingRightContainerGInput.current = false;
    handleLeftSidebarInput(input, key.return, key.backspace);
  });

  function handleRightContainerInput(
    input: string,
    isBackspace: boolean,
    isCtrl: boolean,
    isShift: boolean,
    isTab: boolean,
  ): void {
    if (canMoveDocumentCursor && !isCtrl && input === 'g') {
      if (hasPendingRightContainerGInput.current) {
        hasPendingRightContainerGInput.current = false;
        moveDocumentCursor({
          command: DocumentCursorCommand.JumpToTop,
          visibleRowCount: visibleDocumentRowCount,
        });
        return;
      }

      hasPendingRightContainerGInput.current = true;
      return;
    }

    hasPendingRightContainerGInput.current = false;

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

    if (input === 'a' && hasOpenDocumentTabs) {
      startCreateDocument();
      return;
    }

    if (canMoveDocumentCursor && isCtrl && input === 'd') {
      moveDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: getDocumentPageMoveDelta(visibleDocumentRowCount),
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && isCtrl && input === 'u') {
      moveDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: -getDocumentPageMoveDelta(visibleDocumentRowCount),
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && input === 'G') {
      moveDocumentCursor({
        command: DocumentCursorCommand.JumpToBottom,
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && input === 'j') {
      moveDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: 1,
        visibleRowCount: visibleDocumentRowCount,
      });
      return;
    }

    if (canMoveDocumentCursor && input === 'k') {
      moveDocumentCursor({
        command: DocumentCursorCommand.MoveRelative,
        delta: -1,
        visibleRowCount: visibleDocumentRowCount,
      });
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
