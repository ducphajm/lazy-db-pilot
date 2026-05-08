import type {MongoCollectionDocument} from '../mongodb/service.js';
import {AppPhase} from './phases.js';

export enum CollectionDocumentTabStatus {
  Empty = 'empty',
  Error = 'error',
  Loaded = 'loaded',
  Loading = 'loading',
}

export enum DocumentTabMoveDirection {
  Backward = -1,
  Forward = 1,
}

export type CollectionDocumentTab = {
  readonly collectionName: string;
  readonly connectionName: string;
  readonly cursorLineIndex: number;
  readonly databaseName: string;
  readonly documents: readonly MongoCollectionDocument[];
  readonly error: string | null;
  readonly id: string;
  readonly scrollOffset: number;
  readonly selectedDocumentIndex: number;
  readonly status: CollectionDocumentTabStatus;
};

export function createCollectionDocumentTabId({
  collectionName,
  connectionName,
  databaseName,
}: {
  readonly collectionName: string;
  readonly connectionName: string;
  readonly databaseName: string;
}): string {
  return JSON.stringify([connectionName, databaseName, collectionName]);
}

export function createLoadingCollectionDocumentTab({
  collectionName,
  connectionName,
  databaseName,
}: {
  readonly collectionName: string;
  readonly connectionName: string;
  readonly databaseName: string;
}): CollectionDocumentTab {
  return {
    collectionName,
    connectionName,
    cursorLineIndex: 0,
    databaseName,
    documents: [],
    error: null,
    id: createCollectionDocumentTabId({
      collectionName,
      connectionName,
      databaseName,
    }),
    scrollOffset: 0,
    selectedDocumentIndex: 0,
    status: CollectionDocumentTabStatus.Loading,
  };
}

export function getActiveCollectionDocumentTab(
  documentTabs: readonly CollectionDocumentTab[],
  activeDocumentTabId: string | null,
): CollectionDocumentTab | null {
  return documentTabs.find(tab => tab.id === activeDocumentTabId) ?? null;
}

export function getDocumentTabPhase(
  tab: CollectionDocumentTab | null,
): AppPhase {
  if (tab === null) {
    return AppPhase.CollectionsLoaded;
  }

  if (tab.status === CollectionDocumentTabStatus.Loading) {
    return AppPhase.LoadingCollectionData;
  }

  if (tab.status === CollectionDocumentTabStatus.Error) {
    return AppPhase.CollectionDataError;
  }

  if (tab.status === CollectionDocumentTabStatus.Empty) {
    return AppPhase.CollectionDataEmpty;
  }

  return AppPhase.CollectionDataLoaded;
}

export function getAdjacentDocumentTabId(
  documentTabs: readonly CollectionDocumentTab[],
  activeDocumentTabId: string,
): string | null {
  const activeIndex = documentTabs.findIndex(tab => tab.id === activeDocumentTabId);

  if (activeIndex === -1 || documentTabs.length <= 1) {
    return null;
  }

  return (
    documentTabs[activeIndex + 1]?.id ??
    documentTabs[activeIndex - 1]?.id ??
    null
  );
}

export function getMovedDocumentTabId(
  documentTabs: readonly CollectionDocumentTab[],
  activeDocumentTabId: string | null,
  direction: DocumentTabMoveDirection,
): string | null {
  if (activeDocumentTabId === null || documentTabs.length <= 1) {
    return null;
  }

  const activeIndex = documentTabs.findIndex(tab => tab.id === activeDocumentTabId);

  if (activeIndex === -1) {
    return null;
  }

  return documentTabs[
    (activeIndex + direction + documentTabs.length) % documentTabs.length
  ]?.id ?? null;
}
