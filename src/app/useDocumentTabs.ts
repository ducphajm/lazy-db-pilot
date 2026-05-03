import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DatabaseType, type DatabaseConnection} from '../connections/types.js';
import {MongoOperation} from '../mongodb/errors.js';
import type {LoadCollectionDocuments} from '../types.js';
import {getDisplayError} from './errors.js';
import {AppPhase} from './phases.js';
import {
  CollectionDocumentTabStatus,
  createCollectionDocumentTabId,
  createLoadingCollectionDocumentTab,
  getActiveCollectionDocumentTab,
  getAdjacentDocumentTabId,
  getDocumentTabPhase,
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
  readonly moveSelectedDocument: (direction: -1 | 1) => void;
  readonly openDocumentTab: (input: {
    readonly collectionName: string;
    readonly databaseName: string;
  }) => void;
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

  const moveSelectedDocument = useCallback(
    (direction: -1 | 1) => {
      setDocumentTabs(currentTabs =>
        currentTabs.map(tab => {
          if (tab.id !== activeDocumentTabId || tab.documents.length === 0) {
            return tab;
          }

          return {
            ...tab,
            selectedDocumentIndex:
              (tab.selectedDocumentIndex + direction + tab.documents.length) %
              tab.documents.length,
          };
        }),
      );
    },
    [activeDocumentTabId],
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
                documents: nextDocuments,
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
                error: displayError,
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
    moveSelectedDocument,
    openDocumentTab,
  };
}
