import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App create collection shortcut', () => {
  it('starts creation with a and submits a valid collection name', async () => {
    const createCollection = vi.fn(async () => undefined);
    const loadCollections = vi.fn(async () => ['logs']);
    const instance = render(
      <App
        createCollection={createCollection}
        loadCollections={loadCollections}
        loadConnectionsList={async () => [mongoConnection()]}
        loadDatabases={async () => ['admin']}
      />,
    );

    await openDatabaseList(instance);
    instance.stdin.write('a');
    await expectFrame(instance, 'New collection: admin');
    instance.stdin.write('logs');
    instance.stdin.write('\r');
    await expectFrame(instance, '- logs');

    expect(createCollection).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
      'logs',
    );
    expect(loadCollections).toHaveBeenCalledWith('mongodb://example', 'admin');
  });

  it('rejects an empty collection name without creating', async () => {
    const createCollection = vi.fn(async () => undefined);
    const instance = render(
      <App
        createCollection={createCollection}
        loadConnectionsList={async () => [mongoConnection()]}
        loadDatabases={async () => ['admin']}
      />,
    );

    await openDatabaseList(instance);
    instance.stdin.write('a');
    await expectFrame(instance, 'New collection: admin');
    instance.stdin.write('   ');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Collection name is');

    expect(createCollection).not.toHaveBeenCalled();
  });

  it('cancels collection creation with Escape', async () => {
    const createCollection = vi.fn(async () => undefined);
    const instance = render(
      <App
        createCollection={createCollection}
        loadConnectionsList={async () => [mongoConnection()]}
        loadDatabases={async () => ['admin']}
      />,
    );

    await openDatabaseList(instance);
    instance.stdin.write('a');
    await expectFrame(instance, 'New collection: admin');
    instance.stdin.write('\x1B');
    await vi.waitFor(() => {
      expect(instance.lastFrame()).not.toContain('New collection');
    });
    expect(createCollection).not.toHaveBeenCalled();
  });

  it('ignores a from a focused collection row', async () => {
    const createCollection = vi.fn(async () => undefined);
    const instance = render(
      <App
        createCollection={createCollection}
        loadCollections={async () => ['users']}
        loadConnectionsList={async () => [mongoConnection()]}
        loadDatabases={async () => ['admin']}
      />,
    );

    await openDatabaseList(instance);
    instance.stdin.write('\r');
    await expectFrame(instance, '- users');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('a');

    expect(instance.lastFrame()).not.toContain('New collection');
    expect(createCollection).not.toHaveBeenCalled();
  });

  it('shows collection creation errors and keeps the editor open', async () => {
    const createCollection = vi.fn(async () => {
      throw new Error('create failed');
    });
    const instance = render(
      <App
        createCollection={createCollection}
        loadConnectionsList={async () => [mongoConnection()]}
        loadDatabases={async () => ['admin']}
      />,
    );

    await openDatabaseList(instance);
    instance.stdin.write('a');
    await expectFrame(instance, 'New collection: admin');
    instance.stdin.write('logs');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Unable to create');

    expect(instance.lastFrame()).toContain('logs');
  });
});

async function openDatabaseList(instance: ReturnType<typeof render>): Promise<void> {
  await expectFrame(instance, 'Saved connections');
  instance.stdin.write('\r');
  await expectFrame(instance, 'Databases loaded.');
}

async function expectFrame(
  instance: ReturnType<typeof render>,
  text: string,
): Promise<void> {
  await vi.waitFor(() => {
    expect(instance.lastFrame()).toContain(text);
  });
}

function mongoConnection(): DatabaseConnection {
  return {
    name: 'Local Mongo',
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url: 'mongodb://example'},
  };
}
