import {Box, Text, useApp, useInput} from 'ink';
import {
  Spinner,
  StatusMessage,
  TextInput,
} from '@inkjs/ui';
import {useCallback, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {
  MongoOperation,
  MongoServiceError,
  MongoValidationError,
} from './mongodb/errors.js';
import {
  listMongoCollections,
  listMongoDatabases,
} from './mongodb/service.js';
import {validateMongoUrl} from './mongodb/validation.js';
import type {LoadCollections, LoadDatabases} from './types.js';

enum AppPhase {
  CollectionError = 'collection-error',
  CollectionsEmpty = 'collections-empty',
  CollectionsLoaded = 'collections-loaded',
  DatabasesEmpty = 'databases-empty',
  DatabasesLoaded = 'databases-loaded',
  DatabaseError = 'database-error',
  LoadingCollections = 'loading-collections',
  LoadingDatabases = 'loading-databases',
  Prompt = 'prompt',
}

type AppProps = {
  readonly loadCollections?: LoadCollections;
  readonly loadDatabases?: LoadDatabases;
  readonly onExit?: () => void;
};

const defaultLoadDatabases: LoadDatabases = url => listMongoDatabases(url);
const defaultLoadCollections: LoadCollections = (url, databaseName) =>
  listMongoCollections(url, databaseName);

export function App({
  loadCollections = defaultLoadCollections,
  loadDatabases = defaultLoadDatabases,
  onExit,
}: AppProps): React.JSX.Element {
  const {exit} = useApp();
  const [phase, setPhase] = useState<AppPhase>(AppPhase.Prompt);
  const [promptKey, setPromptKey] = useState(0);
  const [url, setUrl] = useState('');
  const [promptError, setPromptError] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const exitApp = onExit ?? exit;

  const resetPrompt = useCallback((message: string | null = null) => {
    setUrl('');
    setPromptError(message);
    setOperationError(null);
    setDatabases([]);
    setSelectedDatabase(null);
    setCollections([]);
    setPromptKey(key => key + 1);
    setPhase(AppPhase.Prompt);
  }, []);

  const submitUrl = useCallback((input: string) => {
    try {
      const nextUrl = validateMongoUrl(input);
      setUrl(nextUrl);
      setPromptError(null);
      setOperationError(null);
      setDatabases([]);
      setCollections([]);
      setSelectedDatabase(null);
      setPhase(AppPhase.LoadingDatabases);
    } catch (error: unknown) {
      if (error instanceof MongoValidationError) {
        setPromptError(error.message);
        return;
      }

      setPromptError('Invalid MongoDB URL.');
    }
  }, []);

  const returnToDatabases = useCallback(() => {
    setOperationError(null);
    setCollections([]);
    setPhase(AppPhase.DatabasesLoaded);
  }, []);

  const selectDatabase = useCallback((databaseName: string) => {
    setSelectedDatabase(databaseName);
    setOperationError(null);
    setCollections([]);
    setPhase(AppPhase.LoadingCollections);
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exitApp();
      return;
    }

    if (input === 'q' && phase !== AppPhase.Prompt) {
      exitApp();
      return;
    }

    if (
      input === 'h' &&
      (phase === AppPhase.CollectionsLoaded ||
        phase === AppPhase.CollectionsEmpty)
    ) {
      returnToDatabases();
    }
  });

  useEffect(() => {
    if (phase !== AppPhase.LoadingDatabases) {
      return;
    }

    let isActive = true;

    void loadDatabases(url)
      .then(nextDatabases => {
        if (!isActive) {
          return;
        }

        setDatabases(nextDatabases);
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
  }, [loadDatabases, phase, url]);

  useEffect(() => {
    if (phase !== AppPhase.LoadingCollections || selectedDatabase === null) {
      return;
    }

    let isActive = true;

    void loadCollections(url, selectedDatabase)
      .then(nextCollections => {
        if (!isActive) {
          return;
        }

        setCollections(nextCollections);
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

        setOperationError(
          getDisplayError(error, MongoOperation.ListCollections),
        );
        setPhase(AppPhase.CollectionError);
      });

    return () => {
      isActive = false;
    };
  }, [loadCollections, phase, selectedDatabase, url]);

  if (phase === AppPhase.Prompt) {
    return (
      <Screen>
        <Text>MongoDB URL</Text>
        {promptError ? (
          <StatusMessage variant="error">{promptError}</StatusMessage>
        ) : null}
        <TextInput
          key={promptKey}
          placeholder="mongodb://host:port"
          onSubmit={submitUrl}
        />
      </Screen>
    );
  }

  if (phase === AppPhase.LoadingDatabases) {
    return (
      <Screen>
        <Spinner label="Loading databases" />
      </Screen>
    );
  }

  if (phase === AppPhase.DatabaseError) {
    return (
      <RetryScreen
        message={operationError ?? 'Unable to load databases.'}
        onRetry={() => resetPrompt()}
      />
    );
  }

  if (phase === AppPhase.DatabasesEmpty) {
    return (
      <RetryScreen
        message="No databases are available for this connection."
        onRetry={() => resetPrompt()}
        variant="warning"
      />
    );
  }

  if (phase === AppPhase.DatabasesLoaded) {
    return (
      <Screen>
        <StatusMessage variant="success">Databases loaded.</StatusMessage>
        <Text>Select a database</Text>
        <DatabaseList databases={databases} onSelect={selectDatabase} />
      </Screen>
    );
  }

  if (phase === AppPhase.LoadingCollections) {
    return (
      <Screen>
        <Spinner label="Loading collections" />
      </Screen>
    );
  }

  if (phase === AppPhase.CollectionError) {
    return (
      <RetryScreen
        message={operationError ?? 'Unable to load collections.'}
        onRetry={() => resetPrompt()}
      />
    );
  }

  return (
    <Screen>
      <StatusMessage variant="success">
        {selectedDatabase === null
          ? 'Collections loaded.'
          : `Collections in ${selectedDatabase}`}
      </StatusMessage>
      {phase === AppPhase.CollectionsEmpty ? (
        <Text>No collections found.</Text>
      ) : (
        collections.map(collection => (
          <Text key={collection}>- {collection}</Text>
        ))
      )}
      <Text dimColor>Press h to go back, q or Ctrl+C to exit.</Text>
    </Screen>
  );
}

function DatabaseList({
  databases,
  onSelect,
}: {
  readonly databases: string[];
  readonly onSelect: (database: string) => void;
}): React.JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    setFocusedIndex(index => Math.min(index, Math.max(databases.length - 1, 0)));
  }, [databases.length]);

  useInput((input, key) => {
    if (key.downArrow) {
      setFocusedIndex(index => Math.min(index + 1, databases.length - 1));
      return;
    }

    if (key.upArrow) {
      setFocusedIndex(index => Math.max(index - 1, 0));
      return;
    }

    if (key.return || input === 'l') {
      const focusedDatabase = databases[focusedIndex];

      if (focusedDatabase !== undefined) {
        onSelect(focusedDatabase);
      }
    }
  }, {isActive: databases.length > 0});

  return (
    <Box flexDirection="column">
      {databases.map((database, index) => {
        const isFocused = index === focusedIndex;

        return (
          <Text key={database} color={isFocused ? 'cyan' : undefined}>
            {isFocused ? '>' : ' '} {database}
          </Text>
        );
      })}
    </Box>
  );
}

function Screen({
  children,
}: {
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <Box flexDirection="column" gap={1}>
      {children}
    </Box>
  );
}

function RetryScreen({
  message,
  onRetry,
  variant = 'error',
}: {
  readonly message: string;
  readonly onRetry: () => void;
  readonly variant?: 'error' | 'warning';
}): React.JSX.Element {
  return (
    <Screen>
      <StatusMessage variant={variant}>{message}</StatusMessage>
      <TextInput placeholder="Press Enter to retry" onSubmit={onRetry} />
    </Screen>
  );
}

function getDisplayError(error: unknown, operation: MongoOperation): string {
  if (error instanceof MongoServiceError) {
    return error.message;
  }

  switch (operation) {
    case MongoOperation.ListCollections:
      return 'Unable to load collections from the selected database.';
    case MongoOperation.ListDatabases:
      return 'Unable to connect to MongoDB or list databases.';
  }
}
