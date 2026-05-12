import {useEffect, type Dispatch, type SetStateAction} from 'react';
import {DatabaseType, type DatabaseConnection} from '../connections/types.js';
import {MongoOperation} from '../mongodb/errors.js';
import type {LoadCollections, LoadDatabases} from '../types.js';
import {getDisplayError} from './errors.js';
import {AppPhase} from './phases.js';

export function useMongoBrowserLoading({
  loadCollections,
  loadDatabases,
  phase,
  selectedConnection,
  selectedDatabase,
  setCollectionsByDatabaseName,
  setDatabases,
  setExpandedDatabaseNames,
  setOperationError,
  setPhase,
  setSelectedCollection,
}: {
  readonly loadCollections: LoadCollections;
  readonly loadDatabases: LoadDatabases;
  readonly phase: AppPhase;
  readonly selectedConnection: DatabaseConnection | null;
  readonly selectedDatabase: string | null;
  readonly setCollectionsByDatabaseName: Dispatch<
    SetStateAction<ReadonlyMap<string, readonly string[]>>
  >;
  readonly setDatabases: Dispatch<SetStateAction<string[]>>;
  readonly setExpandedDatabaseNames: Dispatch<SetStateAction<ReadonlySet<string>>>;
  readonly setOperationError: Dispatch<SetStateAction<string | null>>;
  readonly setPhase: Dispatch<SetStateAction<AppPhase>>;
  readonly setSelectedCollection: Dispatch<SetStateAction<string | null>>;
}): void {
  useEffect(() => {
    if (
      phase !== AppPhase.LoadingDatabases ||
      selectedConnection?.type !== DatabaseType.MongoDB
    ) {
      return;
    }

    let isActive = true;

    void loadDatabases(selectedConnection.details.url)
      .then(nextDatabases => {
        if (!isActive) {
          return;
        }

        setDatabases(nextDatabases);
        setCollectionsByDatabaseName(new Map());
        setExpandedDatabaseNames(new Set());
        setPhase(
          nextDatabases.length > 0
            ? AppPhase.DatabasesLoaded
            : AppPhase.DatabasesEmpty,
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setOperationError(getDisplayError(error, MongoOperation.ListDatabases));
        setPhase(AppPhase.DatabaseError);
      });

    return () => {
      isActive = false;
    };
  }, [
    loadDatabases,
    phase,
    selectedConnection,
    setCollectionsByDatabaseName,
    setDatabases,
    setExpandedDatabaseNames,
    setOperationError,
    setPhase,
  ]);

  useEffect(() => {
    if (
      phase !== AppPhase.LoadingCollections ||
      selectedConnection?.type !== DatabaseType.MongoDB ||
      selectedDatabase === null
    ) {
      return;
    }

    let isActive = true;

    void loadCollections(selectedConnection.details.url, selectedDatabase)
      .then(nextCollections => {
        if (!isActive) {
          return;
        }

        setCollectionsByDatabaseName(previousCollections => {
          const nextCollectionsByDatabaseName = new Map(previousCollections);
          nextCollectionsByDatabaseName.set(selectedDatabase, nextCollections);
          return nextCollectionsByDatabaseName;
        });
        setSelectedCollection(null);
        setPhase(
          nextCollections.length > 0
            ? AppPhase.CollectionsLoaded
            : AppPhase.CollectionsEmpty,
        );
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setOperationError(getDisplayError(error, MongoOperation.ListCollections));
        setPhase(AppPhase.CollectionError);
      });

    return () => {
      isActive = false;
    };
  }, [
    loadCollections,
    phase,
    selectedConnection,
    selectedDatabase,
    setCollectionsByDatabaseName,
    setOperationError,
    setPhase,
    setSelectedCollection,
  ]);
}
