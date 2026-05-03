import {AppPhase} from './phases.js';

export enum MongoBrowserContainer {
  LeftSidebar = 'left-sidebar',
  RightData = 'right-data',
}

export enum MongoBrowserSidebarItemType {
  Database = 'database',
  Collection = 'collection',
}

export type MongoBrowserSidebarItem =
  | {
      readonly databaseName: string;
      readonly key: string;
      readonly label: string;
      readonly type: MongoBrowserSidebarItemType.Database;
    }
  | {
      readonly collectionName: string;
      readonly databaseName: string;
      readonly key: string;
      readonly label: string;
      readonly type: MongoBrowserSidebarItemType.Collection;
    };

export function isMongoBrowserPhase(phase: AppPhase): boolean {
  return (
    phase === AppPhase.DatabasesLoaded ||
    phase === AppPhase.LoadingCollections ||
    phase === AppPhase.CollectionsLoaded ||
    phase === AppPhase.CollectionsEmpty ||
    phase === AppPhase.CollectionError ||
    phase === AppPhase.LoadingCollectionData ||
    phase === AppPhase.CollectionDataLoaded ||
    phase === AppPhase.CollectionDataEmpty ||
    phase === AppPhase.CollectionDataError
  );
}

export function canFocusMongoBrowserRightData(phase: AppPhase): boolean {
  return (
    phase === AppPhase.LoadingCollectionData ||
    phase === AppPhase.CollectionDataLoaded ||
    phase === AppPhase.CollectionDataEmpty ||
    phase === AppPhase.CollectionDataError
  );
}

export function getMongoBrowserSidebarItems({
  collections,
  databases,
  isDatabaseFolderOpen,
  selectedDatabase,
}: {
  readonly collections: readonly string[];
  readonly databases: readonly string[];
  readonly isDatabaseFolderOpen: boolean;
  readonly selectedDatabase: string | null;
}): MongoBrowserSidebarItem[] {
  const items: MongoBrowserSidebarItem[] = [];

  for (const databaseName of databases) {
    const isExpanded =
      isDatabaseFolderOpen && selectedDatabase === databaseName;

    items.push({
      databaseName,
      key: `database:${databaseName}`,
      label: `${isExpanded ? '[-]' : '[+]'} ${databaseName}`,
      type: MongoBrowserSidebarItemType.Database,
    });

    if (!isExpanded) {
      continue;
    }

    for (const collectionName of collections) {
      items.push({
        collectionName,
        databaseName,
        key: `collection:${databaseName}:${collectionName}`,
        label: `  - ${collectionName}`,
        type: MongoBrowserSidebarItemType.Collection,
      });
    }
  }

  return items;
}

export function moveSidebarIndex({
  currentIndex,
  direction,
  itemCount,
}: {
  readonly currentIndex: number;
  readonly direction: -1 | 1;
  readonly itemCount: number;
}): number {
  if (itemCount === 0) {
    return 0;
  }

  return (currentIndex + direction + itemCount) % itemCount;
}

export function clampSidebarIndex(
  currentIndex: number,
  itemCount: number,
): number {
  if (itemCount === 0) {
    return 0;
  }

  return Math.min(currentIndex, itemCount - 1);
}
