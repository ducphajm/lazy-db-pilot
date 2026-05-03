import {useCallback, useEffect, useState} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {DatabaseConnection} from '../connections/types.js';
import {AppPhase} from './phases.js';
import {ConfirmDeleteAction} from './ui.js';

export type DeleteConnection = (name: string) => Promise<DatabaseConnection[]>;

export function useConnectionDeletion({
  connections,
  deleteConnectionByName,
  phase,
  setConnections,
  setOperationError,
  setPhase,
  setSelectedConnection,
}: {
  readonly connections: readonly DatabaseConnection[];
  readonly deleteConnectionByName: DeleteConnection;
  readonly phase: AppPhase;
  readonly setConnections: Dispatch<SetStateAction<DatabaseConnection[]>>;
  readonly setOperationError: Dispatch<SetStateAction<string | null>>;
  readonly setPhase: Dispatch<SetStateAction<AppPhase>>;
  readonly setSelectedConnection: Dispatch<SetStateAction<DatabaseConnection | null>>;
}) {
  const [connectionPendingDeletion, setConnectionPendingDeletion] =
    useState<DatabaseConnection | null>(null);

  const clearPendingDeletion = useCallback(() => {
    setConnectionPendingDeletion(null);
  }, []);

  const requestConnectionDeletion = useCallback((connection: DatabaseConnection) => {
    setSelectedConnection(connection);
    setConnectionPendingDeletion(connection);
    setOperationError(null);
    setPhase(AppPhase.ConfirmingConnectionDeletion);
  }, [setOperationError, setPhase, setSelectedConnection]);

  const handleDeleteConfirmation = useCallback(
    (action: ConfirmDeleteAction) => {
      if (action === ConfirmDeleteAction.Cancel) {
        setConnectionPendingDeletion(null);
        setSelectedConnection(null);
        setPhase(
          connections.length > 0
            ? AppPhase.ConnectionsLoaded
            : AppPhase.CreatingConnection,
        );
        return;
      }

      setPhase(AppPhase.DeletingConnection);
    },
    [connections.length, setPhase, setSelectedConnection],
  );

  useEffect(() => {
    if (
      phase !== AppPhase.DeletingConnection ||
      connectionPendingDeletion === null
    ) {
      return;
    }

    let isActive = true;

    void deleteConnectionByName(connectionPendingDeletion.name)
      .then(nextConnections => {
        if (!isActive) {
          return;
        }

        setConnections([...nextConnections]);
        setConnectionPendingDeletion(null);
        setSelectedConnection(null);
        setPhase(
          nextConnections.length > 0
            ? AppPhase.ConnectionsLoaded
            : AppPhase.CreatingConnection,
        );
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setOperationError('Unable to delete saved connection.');
        setConnectionPendingDeletion(null);
        setPhase(AppPhase.ConnectionsError);
      });

    return () => {
      isActive = false;
    };
  }, [
    connectionPendingDeletion,
    deleteConnectionByName,
    phase,
    setConnections,
    setOperationError,
    setPhase,
    setSelectedConnection,
  ]);

  return {
    clearPendingDeletion,
    handleDeleteConfirmation,
    requestConnectionDeletion,
  };
}
