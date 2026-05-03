import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {
  clearText,
  fillConnectionForm,
  selectConnectionEnvironment,
  selectConnectionType,
} from './appTestHelpers.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {ConnectionInput, DatabaseConnection} from './connections/types.js';
import {MongoOperation, MongoServiceError} from './mongodb/errors.js';

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('creates a MongoDB connection and browses databases and collections', async () => {
    const savedConnection = mongoConnection(
      'Local Mongo',
      'mongodb://user:secret@example',
    );
    const saveConnection = vi.fn(async () => [savedConnection]);
    const loadDatabases = vi.fn(async () => ['admin']);
    const loadCollections = vi.fn(async () => ['users']);
    const loadCollectionDocuments = vi.fn(async () => [
      {_id: 'abc123', name: 'Ada'},
    ]);
    const instance = render(
      <App
        loadConnectionsList={async () => []}
        saveConnection={saveConnection}
        loadDatabases={loadDatabases}
        loadCollections={loadCollections}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await fillConnectionForm(instance, {
      name: 'Local Mongo',
      type: DatabaseType.MongoDB,
      environment: ConnectionEnvironment.Local,
      mongoUrl: 'mongodb://user:secret@example',
    });

    await expectFrame(instance, 'Saved connections');
    expect(instance.lastFrame()).not.toContain('secret');
    expect(saveConnection).toHaveBeenCalledWith({
      name: 'Local Mongo',
      type: DatabaseType.MongoDB,
      environment: ConnectionEnvironment.Local,
      details: {url: 'mongodb://user:secret@example'},
    } satisfies ConnectionInput);

    instance.stdin.write('\r');
    await expectFrame(instance, 'Databases loaded.');
    expect(loadDatabases).toHaveBeenCalledWith(
      'mongodb://user:secret@example',
    );
    expect(instance.lastFrame()).not.toContain('secret');

    instance.stdin.write('l');
    await expectFrame(instance, 'Collections in admin');
    expect(loadCollections).toHaveBeenCalledWith(
      'mongodb://user:secret@example',
      'admin',
    );
    expect(instance.lastFrame()).toContain('> users');
    expect(instance.lastFrame()).not.toContain('secret');

    instance.stdin.write('\r');
    await expectFrame(instance, 'Documents in users');
    expect(loadCollectionDocuments).toHaveBeenCalledWith(
      'mongodb://user:secret@example',
      'admin',
      'users',
    );
    expect(instance.lastFrame()).toContain('_id');
    expect(instance.lastFrame()).toContain('Ada');
    expect(instance.lastFrame()).not.toContain('secret');
  });

  it('uses j and k navigation without moving beyond list bounds', async () => {
    const loadCollections = vi.fn(async () => ['users']);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin', 'app']}
        loadCollections={loadCollections}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Databases loaded.');

    instance.stdin.write('j');
    await expectFrame(instance, '> app');
    instance.stdin.write('j');
    await expectFrame(instance, '> app');
    instance.stdin.write('k');
    await expectFrame(instance, '> admin');
    instance.stdin.write('k');
    await expectFrame(instance, '> admin');
    instance.stdin.write('\r');

    await expectFrame(instance, 'Collections in admin');
    expect(loadCollections).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
    );
  });

  it('loads collection data with Vim-style collection selection', async () => {
    const loadCollectionDocuments = vi.fn(async () => [
      {_id: '1', name: 'Grace', profile: {role: 'admin'}},
    ]);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Databases loaded.');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Collections in admin');
    instance.stdin.write('l');

    await expectFrame(instance, 'Documents in users');
    expect(loadCollectionDocuments).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
      'users',
    );
    expect(instance.lastFrame()).toContain('profile');
    expect(instance.lastFrame()).toContain('"role": "admin"');
  });

  it('handles collection data empty, failure, and back navigation states', async () => {
    const emptyInstance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => []}
      />,
    );

    await expectFrame(emptyInstance, 'Saved connections');
    emptyInstance.stdin.write('\r');
    await expectFrame(emptyInstance, 'Databases loaded.');
    emptyInstance.stdin.write('\r');
    await expectFrame(emptyInstance, 'Collections in admin');
    emptyInstance.stdin.write('\r');
    await expectFrame(emptyInstance, 'No documents found in users.');
    emptyInstance.stdin.write('h');
    await expectFrame(emptyInstance, 'Collections in admin');

    const failingInstance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Prod Mongo', 'mongodb://user:secret@example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => {
          throw new MongoServiceError(
            MongoOperation.LoadCollectionDocuments,
            new Error('mongodb://user:secret@example failed'),
          );
        }}
      />,
    );

    await expectFrame(failingInstance, 'Saved connections');
    failingInstance.stdin.write('\r');
    await expectFrame(failingInstance, 'Databases loaded.');
    failingInstance.stdin.write('\r');
    await expectFrame(failingInstance, 'Collections in admin');
    failingInstance.stdin.write('\r');
    await expectFrame(
      failingInstance,
      'Unable to load documents from the selected collection.',
    );
    expect(failingInstance.lastFrame()).not.toContain('secret');
    failingInstance.stdin.write('h');
    await expectFrame(failingInstance, 'Collections in admin');
  });

  it('validates connection creation input', async () => {
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Existing', 'mongodb://example'),
        ]}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('j');
    await expectFrame(instance, '> Create connection');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection form');

    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection name is required.');

    instance.stdin.write('Existing');
    await expectFrame(instance, 'Name: Existing');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection name must be unique.');

    const invalidMongoInstance = render(<App loadConnectionsList={async () => []} />);

    await expectFrame(invalidMongoInstance, 'Connection form');
    invalidMongoInstance.stdin.write('New Mongo');
    await expectFrame(invalidMongoInstance, 'Name: New Mongo');
    await selectConnectionType(invalidMongoInstance, DatabaseType.MongoDB);
    await selectConnectionEnvironment(
      invalidMongoInstance,
      ConnectionEnvironment.Local,
    );
    invalidMongoInstance.stdin.write('\t');
    await expectFrame(invalidMongoInstance, '> MongoDB URL');
    invalidMongoInstance.stdin.write('https://example.com');
    await expectFrame(invalidMongoInstance, 'https://example.com');
    invalidMongoInstance.stdin.write('\r');

    await expectFrame(
      invalidMongoInstance,
      'MongoDB URL must start with mongodb:// or mongodb+srv://.',
    );
  });

  it('saves Redis and SQLite connections without type-specific details', async () => {
    const saveConnection = vi.fn(
      async (input: ConnectionInput): Promise<DatabaseConnection[]> => {
        void input;
        return [];
      },
    );
    saveConnection
      .mockResolvedValueOnce([
        redisConnection('Redis', ConnectionEnvironment.Development),
      ])
      .mockResolvedValueOnce([
        redisConnection('Redis', ConnectionEnvironment.Development),
        sqliteConnection('SQLite', ConnectionEnvironment.Production),
      ]);
    const instance = render(
      <App loadConnectionsList={async () => []} saveConnection={saveConnection} />,
    );

    await fillConnectionForm(instance, {
      name: 'Redis',
      type: DatabaseType.Redis,
      environment: ConnectionEnvironment.Development,
    });
    await expectFrame(instance, 'Saved connections');
    expect(saveConnection).toHaveBeenNthCalledWith(1, {
      name: 'Redis',
      type: DatabaseType.Redis,
      environment: ConnectionEnvironment.Development,
      details: {},
    } satisfies ConnectionInput);

    instance.stdin.write('j');
    await expectFrame(instance, '> Create connection');
    instance.stdin.write('\r');
    await fillConnectionForm(instance, {
      name: 'SQLite',
      type: DatabaseType.SQLite,
      environment: ConnectionEnvironment.Production,
    });

    await expectFrame(instance, 'Saved connections');
    expect(saveConnection).toHaveBeenNthCalledWith(2, {
      name: 'SQLite',
      type: DatabaseType.SQLite,
      environment: ConnectionEnvironment.Production,
      details: {},
    } satisfies ConnectionInput);
  });

  it('does not connect for Redis and SQLite selections', async () => {
    const loadDatabases = vi.fn(async () => ['admin']);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          redisConnection('Redis', ConnectionEnvironment.Local),
          sqliteConnection('SQLite', ConnectionEnvironment.Local),
        ]}
        loadDatabases={loadDatabases}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, 'redis connections are not supported yet.');
    expect(loadDatabases).not.toHaveBeenCalled();

    instance.stdin.write('\r');
    await expectFrame(instance, 'Redis [redis/local]');
    instance.stdin.write('j');
    await expectFrame(instance, '> SQLite');
    instance.stdin.write('\r');
    await expectFrame(instance, 'sqlite connections are not supported yet.');
    expect(loadDatabases).not.toHaveBeenCalled();
  });

  it('recovers from empty and failed database states', async () => {
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => []}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, 'No databases are available');
    instance.stdin.write('j');
    await expectFrame(instance, '> Create connection');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection form');

    const failingInstance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Prod Mongo', 'mongodb://user:secret@example'),
        ]}
        loadDatabases={async () => {
          throw new MongoServiceError(
            MongoOperation.ListDatabases,
            new Error('mongodb://user:secret@example failed'),
          );
        }}
      />,
    );

    await expectFrame(failingInstance, 'Saved connections');
    failingInstance.stdin.write('\r');
    await expectFrame(
      failingInstance,
      'Unable to connect to MongoDB or list databases.',
    );
    expect(failingInstance.lastFrame()).not.toContain('secret');
    failingInstance.stdin.write('\r');
    await expectFrame(failingInstance, 'Saved connections');
  });

  it('allows q in the connection form and quits outside prompts', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App
        loadConnectionsList={async () => []}
        onExit={onExit}
        saveConnection={async () => [
          redisConnection('Quit Test', ConnectionEnvironment.Local),
        ]}
      />,
    );

    await expectFrame(instance, 'Connection form');
    instance.stdin.write('q');
    await expectFrame(instance, 'Name: q');
    expect(onExit).not.toHaveBeenCalled();
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection details are incomplete.');
    await clearText(instance, 'q');
    await fillConnectionForm(instance, {
      name: 'Quit Test',
      type: DatabaseType.Redis,
      environment: ConnectionEnvironment.Local,
    });
    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('q');

    await expectCallback(onExit);
  });
});

async function expectFrame(
  instance: ReturnType<typeof render>,
  text: string,
): Promise<void> {
  await vi.waitFor(() => {
    expect(instance.lastFrame()).toContain(text);
  });
}

async function expectCallback(callback: ReturnType<typeof vi.fn>): Promise<void> {
  await vi.waitFor(() => {
    expect(callback).toHaveBeenCalledTimes(1);
  });
}

function mongoConnection(name: string, url: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url},
  };
}

function redisConnection(
  name: string,
  environment: ConnectionEnvironment,
): DatabaseConnection {
  return {
    name,
    type: DatabaseType.Redis,
    environment,
    details: {},
  };
}

function sqliteConnection(
  name: string,
  environment: ConnectionEnvironment,
): DatabaseConnection {
  return {
    name,
    type: DatabaseType.SQLite,
    environment,
    details: {},
  };
}
