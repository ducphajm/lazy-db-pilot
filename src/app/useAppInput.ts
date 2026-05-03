import {useInput} from 'ink';
import type {Dispatch, SetStateAction} from 'react';
import {DocumentTabMoveDirection} from './documentTabs.js';
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
  readonly canMoveSelectedDocument: boolean;
  readonly closeActiveDocumentTab: () => void;
  readonly closeDatabaseFolder: () => void;
  readonly exitApp: () => void;
  readonly focusLeftSidebar: () => void;
  readonly hasOpenDocumentTabs: boolean;
  readonly moveActiveDocumentTab: (
    direction: DocumentTabMoveDirection,
  ) => void;
  readonly moveSelectedDocument: (direction: -1 | 1) => void;
  readonly phase: AppPhase;
  readonly selectedSidebarIndex: number;
  readonly selectCollection: (collectionName: string) => void;
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
  canMoveSelectedDocument,
  closeActiveDocumentTab,
  closeDatabaseFolder,
  exitApp,
  focusLeftSidebar,
  hasOpenDocumentTabs,
  moveActiveDocumentTab,
  moveSelectedDocument,
  phase,
  selectedSidebarIndex,
  selectCollection,
  selectDatabase,
  setActiveBrowserContainer,
  setSelectedSidebarIndex,
  showConnectionList,
}: UseAppInputParams): void {
  const focusedSidebarItem = browserSidebarItems[selectedSidebarIndex];

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
      handleRightContainerInput(input, key.backspace, key.shift, key.tab);
      return;
    }

    handleLeftSidebarInput(input, key.return, key.backspace);
  });

  function handleRightContainerInput(
    input: string,
    isBackspace: boolean,
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

    if (canMoveSelectedDocument && input === 'j') {
      moveSelectedDocument(1);
      return;
    }

    if (canMoveSelectedDocument && input === 'k') {
      moveSelectedDocument(-1);
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
      closeDatabaseFolder();
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
      selectCollection(focusedSidebarItem.collectionName);
    }
  }
}
