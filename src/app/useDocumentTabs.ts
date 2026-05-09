import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DatabaseType, type DatabaseConnection} from '../connections/types.js';
import {MongoOperation} from '../mongodb/errors.js';
import type {LoadCollectionDocuments} from '../types.js';
import {getDocumentCardMetrics} from '../tui/DocumentCardList.js';
import {getDisplayError} from './errors.js';
import {AppPhase} from './phases.js';
import {
  CollectionDocumentTabStatus,
  DocumentTabMoveDirection,
  createCollectionDocumentTabId,
  createLoadingCollectionDocumentTab,
  getActiveCollectionDocumentTab,
  getAdjacentDocumentTabId,
  getDocumentTabPhase,
  getMovedDocumentTabId,
  type CollectionDocumentTab,
} from './documentTabs.js';

export function useDocumentTabs({
  loadCollectionDocuments,
  selectedConnection,
  setPhase,
}: {
  readonly loadCollectionDocuments: LoadCollectionDocuments;
  readonly selectedConnection: DatabaseConnection | null;
  readonly setPhase: (phase: AppPhase) => void;
}): {
  readonly activeDocumentTab: CollectionDocumentTab | null;
  readonly clearDocumentTabs: () => void;
  readonly closeActiveDocumentTab: () => void;
  readonly documentTabs: readonly CollectionDocumentTab[];
  readonly moveActiveDocumentTab: (
    direction: DocumentTabMoveDirection,
  ) => void;
  readonly moveDocumentCursor: (input: {
    readonly delta: number;
    readonly visibleRowCount: number | undefined;
  }) => void;
  readonly openDocumentTab: (input: {
    readonly collectionName: string;
    readonly databaseName: string;
  }) => void;
  readonly reloadDocumentTab: (tabId: string) => void;
} {
  const [documentTabs, setDocumentTabs] = useState<CollectionDocumentTab[]>([]);
  const [activeDocumentTabId, setActiveDocumentTabId] = useState<string | null>(
    null,
  );
  const loadingDocumentTabIds = useRef<Set<string>>(new Set());
  const activeDocumentTabIdRef = useRef<string | null>(null);
  const activeDocumentTab = useMemo(
    () => getActiveCollectionDocumentTab(documentTabs, activeDocumentTabId),
    [activeDocumentTabId, documentTabs],
  );

  useEffect(() => {
    activeDocumentTabIdRef.current = activeDocumentTabId;
  }, [activeDocumentTabId]);

  const clearDocumentTabs = useCallback(() => {
    loadingDocumentTabIds.current.clear();
    activeDocumentTabIdRef.current = null;
    setDocumentTabs([]);
    setActiveDocumentTabId(null);
  }, []);

  const openDocumentTab = useCallback(({
    collectionName,
    databaseName,
  }: {
    readonly collectionName: string;
    readonly databaseName: string;
  }) => {
    if (selectedConnection === null) {
      return;
    }

    const documentTabId = createCollectionDocumentTabId({
      collectionName,
      connectionName: selectedConnection.name,
      databaseName,
    });

    setDocumentTabs(currentTabs => {
      const existingTab = currentTabs.find(tab => tab.id === documentTabId);
      const nextActiveTab =
        existingTab ??
        createLoadingCollectionDocumentTab({
          collectionName,
          connectionName: selectedConnection.name,
          databaseName,
        });

      activeDocumentTabIdRef.current = documentTabId;
      setActiveDocumentTabId(documentTabId);
      setPhase(getDocumentTabPhase(nextActiveTab));

      if (existingTab !== undefined) {
        return currentTabs;
      }

      return [...currentTabs, nextActiveTab];
    });
  }, [selectedConnection, setPhase]);

  const moveDocumentCursor = useCallback(
    ({
      delta,
      visibleRowCount,
    }: {
      readonly delta: number;
      readonly visibleRowCount: number | undefined;
    }) => {
      setDocumentTabs(currentTabs =>
        currentTabs.map(tab => {
          if (tab.id !== activeDocumentTabId || tab.documents.length === 0) {
            return tab;
          }

          return moveTabDocumentCursor({delta, tab, visibleRowCount});
        }),
      );
    },
    [activeDocumentTabId],
  );

  const moveActiveDocumentTab = useCallback(
    (direction: DocumentTabMoveDirection) => {
      setDocumentTabs(currentTabs => {
        const nextActiveTabId = getMovedDocumentTabId(
          currentTabs,
          activeDocumentTabId,
          direction,
        );

        if (nextActiveTabId === null) {
          return currentTabs;
        }

        const nextActiveTab = getActiveCollectionDocumentTab(
          currentTabs,
          nextActiveTabId,
        );

        activeDocumentTabIdRef.current = nextActiveTabId;
        setActiveDocumentTabId(nextActiveTabId);
        setPhase(getDocumentTabPhase(nextActiveTab));

        return currentTabs;
      });
    },
    [activeDocumentTabId, setPhase],
  );

  const closeActiveDocumentTab = useCallback(() => {
    if (activeDocumentTabId === null) {
      return;
    }

    setDocumentTabs(currentTabs => {
      const nextActiveTabId = getAdjacentDocumentTabId(
        currentTabs,
        activeDocumentTabId,
      );
      const nextTabs = currentTabs.filter(tab => tab.id !== activeDocumentTabId);
      const nextActiveTab = getActiveCollectionDocumentTab(
        nextTabs,
        nextActiveTabId,
      );

      loadingDocumentTabIds.current.delete(activeDocumentTabId);
      activeDocumentTabIdRef.current = nextActiveTabId;
      setActiveDocumentTabId(nextActiveTabId);
      setPhase(getDocumentTabPhase(nextActiveTab));

      return nextTabs;
    });
  }, [activeDocumentTabId, setPhase]);

  const reloadDocumentTab = useCallback((tabId: string) => {
    loadingDocumentTabIds.current.delete(tabId);
    setDocumentTabs(currentTabs =>
      currentTabs.map(tab => {
        if (tab.id !== tabId) {
          return tab;
        }

        return {
          ...tab,
          cursorLineIndex: 0,
          documents: [],
          error: null,
          scrollOffset: 0,
          selectedDocumentIndex: 0,
          status: CollectionDocumentTabStatus.Loading,
        };
      }),
    );

    if (activeDocumentTabIdRef.current === tabId) {
      setPhase(AppPhase.LoadingCollectionData);
    }
  }, [setPhase]);


  useEffect(() => {
    if (selectedConnection?.type !== DatabaseType.MongoDB) {
      return;
    }

    const loadingTabs = documentTabs.filter(
      tab =>
        tab.status === CollectionDocumentTabStatus.Loading &&
        !loadingDocumentTabIds.current.has(tab.id),
    );

    for (const tab of loadingTabs) {
      loadingDocumentTabIds.current.add(tab.id);

      void loadCollectionDocuments(
        selectedConnection.details.url,
        tab.databaseName,
        tab.collectionName,
      )
        .then(nextDocuments => {
          setDocumentTabs(currentTabs =>
            currentTabs.map(currentTab => {
              if (currentTab.id !== tab.id) {
                return currentTab;
              }

              return {
                ...currentTab,
                cursorLineIndex: 0,
                documents: nextDocuments,
                scrollOffset: 0,
                selectedDocumentIndex: 0,
                status:
                  nextDocuments.length > 0
                    ? CollectionDocumentTabStatus.Loaded
                    : CollectionDocumentTabStatus.Empty,
              };
            }),
          );

          if (activeDocumentTabIdRef.current === tab.id) {
            setPhase(
              nextDocuments.length > 0
                ? AppPhase.CollectionDataLoaded
                : AppPhase.CollectionDataEmpty,
            );
          }
        })
        .catch((error: unknown) => {
          const displayError = getDisplayError(
            error,
            MongoOperation.LoadCollectionDocuments,
          );

          setDocumentTabs(currentTabs =>
            currentTabs.map(currentTab => {
              if (currentTab.id !== tab.id) {
                return currentTab;
              }

              return {
                ...currentTab,
                cursorLineIndex: 0,
                error: displayError,
                scrollOffset: 0,
                selectedDocumentIndex: 0,
                status: CollectionDocumentTabStatus.Error,
              };
            }),
          );

          if (activeDocumentTabIdRef.current === tab.id) {
            setPhase(AppPhase.CollectionDataError);
          }
        })
        .finally(() => {
          loadingDocumentTabIds.current.delete(tab.id);
        });
    }
  }, [documentTabs, loadCollectionDocuments, selectedConnection, setPhase]);

  return {
    activeDocumentTab,
    clearDocumentTabs,
    closeActiveDocumentTab,
    documentTabs,
    moveActiveDocumentTab,
    moveDocumentCursor,
    openDocumentTab,
    reloadDocumentTab,
  };
}

export function moveTabDocumentCursor({
  delta,
  tab,
  visibleRowCount,
}: {
  readonly delta: number;
  readonly tab: CollectionDocumentTab;
  readonly visibleRowCount: number | undefined;
}): CollectionDocumentTab {
  const metrics = getDocumentCardMetrics(tab.documents);
  const maxCursorLineIndex = Math.max(0, metrics.cursorLineCount - 1);
  const cursorLineIndex = Math.min(
    Math.max(0, tab.cursorLineIndex + delta),
    maxCursorLineIndex,
  );
  const cursorRowIndex = metrics.rows.findIndex(
    row => row.cursorLineIndex === cursorLineIndex,
  );
  const selectedDocumentIndex =
    metrics.rows[cursorRowIndex]?.documentIndex ?? tab.selectedDocumentIndex;
  const scrollOffset = getNextScrollOffset({
    cursorRowIndex,
    rowCount: metrics.rows.length,
    scrollOffset: tab.scrollOffset,
    visibleRowCount,
  });

  return {
    ...tab,
    cursorLineIndex,
    scrollOffset,
    selectedDocumentIndex,
  };
}

function getNextScrollOffset({
  cursorRowIndex,
  rowCount,
  scrollOffset,
  visibleRowCount,
}: {
  readonly cursorRowIndex: number;
  readonly rowCount: number;
  readonly scrollOffset: number;
  readonly visibleRowCount: number | undefined;
}): number {
  if (visibleRowCount === undefined || visibleRowCount <= 0) {
    return 0;
  }

  const maxScrollOffset = Math.max(0, rowCount - visibleRowCount);
  let nextScrollOffset = Math.min(scrollOffset, maxScrollOffset);

  if (cursorRowIndex < nextScrollOffset) {
    nextScrollOffset = cursorRowIndex;
  }

  if (cursorRowIndex >= nextScrollOffset + visibleRowCount) {
    nextScrollOffset = cursorRowIndex - visibleRowCount + 1;
  }

  return Math.min(Math.max(0, nextScrollOffset), maxScrollOffset);
}
