import {useCallback, useRef, useState, type SetStateAction} from 'react';
import type {DatabaseConnection} from '../connections/types.js';
import {DatabaseType} from '../connections/types.js';
import {MongoOperation} from '../mongodb/errors.js';
import type {InsertCollectionDocument} from '../types.js';
import type {CollectionDocumentTab} from './documentTabs.js';
import {CollectionDocumentTabStatus} from './documentTabs.js';
import {getDisplayError} from './errors.js';
import {
  createDocumentDraft,
  parseCreateDocumentText,
  type CreateDocumentDraft,
} from './createDocument.js';

export type UseCreateDocumentDraftResult = {
  readonly createDocumentDraft: CreateDocumentDraft | null;
  readonly cancelCreateDocument: () => void;
  readonly startCreateDocument: (tab: CollectionDocumentTab | null) => void;
  readonly submitCreateDocument: () => void;
  readonly updateCreateDocumentText: (text: SetStateAction<string>) => void;
};

export function useCreateDocumentDraft({
  insertCollectionDocument,
  reloadDocumentTab,
  selectedConnection,
}: {
  readonly insertCollectionDocument: InsertCollectionDocument;
  readonly reloadDocumentTab: (tabId: string) => void;
  readonly selectedConnection: DatabaseConnection | null;
}): UseCreateDocumentDraftResult {
  const [draft, setDraft] = useState<CreateDocumentDraft | null>(null);
  const draftRef = useRef<CreateDocumentDraft | null>(null);

  const setCurrentDraft = useCallback((nextDraft: CreateDocumentDraft | null) => {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, []);

  const cancelCreateDocument = useCallback(() => {
    setCurrentDraft(null);
  }, [setCurrentDraft]);

  const startCreateDocument = useCallback(
    (tab: CollectionDocumentTab | null) => {
      if (
        tab === null ||
        selectedConnection?.type !== DatabaseType.MongoDB ||
        !canCreateDocumentForTab(tab)
      ) {
        return;
      }

      setCurrentDraft(
        createDocumentDraft({
          collectionName: tab.collectionName,
          databaseName: tab.databaseName,
          tabId: tab.id,
          url: selectedConnection.details.url,
        }),
      );
    },
    [selectedConnection, setCurrentDraft],
  );

  const updateCreateDocumentText = useCallback(
    (nextText: SetStateAction<string>) => {
      const currentDraft = draftRef.current;

      if (currentDraft === null) {
        return;
      }

      const text =
        typeof nextText === 'function' ? nextText(currentDraft.text) : nextText;

      setCurrentDraft({...currentDraft, error: null, text});
    },
    [setCurrentDraft],
  );

  const submitCreateDocument = useCallback(() => {
    const currentDraft = draftRef.current;

    if (currentDraft === null || currentDraft.isSubmitting) {
      return;
    }

    let document;

    try {
      document = parseCreateDocumentText(currentDraft.text);
    } catch (error: unknown) {
      setCurrentDraft({
        ...currentDraft,
        error:
          error instanceof Error ? error.message : 'Document JSON is invalid.',
      });
      return;
    }

    setCurrentDraft({...currentDraft, error: null, isSubmitting: true});

    void insertCollectionDocument(
      currentDraft.url,
      currentDraft.databaseName,
      currentDraft.collectionName,
      document,
    )
      .then(() => {
        setCurrentDraft(null);
        reloadDocumentTab(currentDraft.tabId);
      })
      .catch((error: unknown) => {
        setCurrentDraft({
          ...currentDraft,
          error: getDisplayError(error, MongoOperation.InsertDocument),
          isSubmitting: false,
        });
      });
  }, [insertCollectionDocument, reloadDocumentTab, setCurrentDraft]);

  return {
    createDocumentDraft: draft,
    cancelCreateDocument,
    startCreateDocument,
    submitCreateDocument,
    updateCreateDocumentText,
  };
}

function canCreateDocumentForTab(tab: CollectionDocumentTab): boolean {
  return (
    tab.status === CollectionDocumentTabStatus.Loaded ||
    tab.status === CollectionDocumentTabStatus.Empty
  );
}
