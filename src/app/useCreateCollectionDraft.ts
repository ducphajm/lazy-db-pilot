import {useCallback, useRef, useState, type SetStateAction} from 'react';
import type {DatabaseConnection} from '../connections/types.js';
import {DatabaseType} from '../connections/types.js';
import {MongoOperation} from '../mongodb/errors.js';
import type {CreateCollection} from '../types.js';
import {
  createCollectionDraft,
  validateCreateCollectionName,
  type CreateCollectionDraft,
} from './createCollection.js';
import {getDisplayError} from './errors.js';

export type UseCreateCollectionDraftResult = {
  readonly createCollectionDraft: CreateCollectionDraft | null;
  readonly cancelCreateCollection: () => void;
  readonly startCreateCollection: (databaseName: string) => void;
  readonly submitCreateCollection: () => void;
  readonly updateCreateCollectionName: (name: SetStateAction<string>) => void;
};

export function useCreateCollectionDraft({
  createCollection,
  onCreated,
  selectedConnection,
}: {
  readonly createCollection: CreateCollection;
  readonly onCreated: (databaseName: string) => void;
  readonly selectedConnection: DatabaseConnection | null;
}): UseCreateCollectionDraftResult {
  const [draft, setDraft] = useState<CreateCollectionDraft | null>(null);
  const draftRef = useRef<CreateCollectionDraft | null>(null);

  const setCurrentDraft = useCallback((nextDraft: CreateCollectionDraft | null) => {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, []);

  const cancelCreateCollection = useCallback(() => {
    setCurrentDraft(null);
  }, [setCurrentDraft]);

  const startCreateCollection = useCallback(
    (databaseName: string) => {
      if (selectedConnection?.type !== DatabaseType.MongoDB) {
        return;
      }

      setCurrentDraft(
        createCollectionDraft({
          databaseName,
          url: selectedConnection.details.url,
        }),
      );
    },
    [selectedConnection, setCurrentDraft],
  );

  const updateCreateCollectionName = useCallback(
    (nextName: SetStateAction<string>) => {
      const currentDraft = draftRef.current;

      if (currentDraft === null) {
        return;
      }

      const name =
        typeof nextName === 'function' ? nextName(currentDraft.name) : nextName;

      setCurrentDraft({...currentDraft, error: null, name});
    },
    [setCurrentDraft],
  );

  const submitCreateCollection = useCallback(() => {
    const currentDraft = draftRef.current;

    if (currentDraft === null || currentDraft.isSubmitting) {
      return;
    }

    let collectionName: string;

    try {
      collectionName = validateCreateCollectionName(currentDraft.name);
    } catch (error: unknown) {
      setCurrentDraft({
        ...currentDraft,
        error:
          error instanceof Error ? error.message : 'Collection name is invalid.',
      });
      return;
    }

    setCurrentDraft({...currentDraft, error: null, isSubmitting: true});

    void createCollection(
      currentDraft.url,
      currentDraft.databaseName,
      collectionName,
    )
      .then(() => {
        setCurrentDraft(null);
        onCreated(currentDraft.databaseName);
      })
      .catch((error: unknown) => {
        setCurrentDraft({
          ...currentDraft,
          error: getDisplayError(error, MongoOperation.CreateCollection),
          isSubmitting: false,
        });
      });
  }, [createCollection, onCreated, setCurrentDraft]);

  return {
    createCollectionDraft: draft,
    cancelCreateCollection,
    startCreateCollection,
    submitCreateCollection,
    updateCreateCollectionName,
  };
}
