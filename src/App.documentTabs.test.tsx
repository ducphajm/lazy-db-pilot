import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App document tabs', () => {
  it('opens two collections as tabs and preserves the first tab data', async () => {
    const loadCollectionDocuments = vi.fn(
      async (
        url: string,
        databaseName: string,
        collectionName: string,
      ) => {
        void url;
        void databaseName;

        if (collectionName === 'users') {
          return [{_id: 'user-1', name: 'Ada'}];
        }

        return [{_id: 'order-1', total: 42}];
      },
    );
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users', 'orders']}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, 'Ada');
    expect(instance.lastFrame()).toContain('admin.users');

    instance.stdin.write('h');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - orders');
    instance.stdin.write('\r');
    await expectFrame(instance, '42');

    expect(instance.lastFrame()).toContain('admin.users');
    expect(instance.lastFrame()).toContain('admin.orders');

    instance.stdin.write('h');
    await expectFrame(instance, '>   - orders');
    instance.stdin.write('k');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Ada');

    expect(loadCollectionDocuments).toHaveBeenCalledTimes(2);
    expect(instance.lastFrame()).toContain('admin.users');
    expect(instance.lastFrame()).toContain('admin.orders');
  });

  it('activates an existing collection tab without duplicating it', async () => {
    const loadCollectionDocuments = vi.fn(async () => [
      {_id: 'user-1', name: 'Ada'},
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

    await openCollection(instance, 'users');
    await expectFrame(instance, 'Ada');
    instance.stdin.write('h');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Ada');

    expect(loadCollectionDocuments).toHaveBeenCalledTimes(1);
    expect(countOccurrences(instance.lastFrame() ?? '', 'admin.users')).toBe(1);
  });

  it('moves between open tabs with Tab and Shift+Tab without reloading tabs', async () => {
    const loadCollectionDocuments = vi.fn(
      async (
        url: string,
        databaseName: string,
        collectionName: string,
      ) => {
        void url;
        void databaseName;

        return [{_id: collectionName, label: `${collectionName} data`}];
      },
    );
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users', 'orders', 'audit']}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, 'users data');
    instance.stdin.write('h');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - orders');
    instance.stdin.write('\r');
    await expectFrame(instance, 'orders data');
    instance.stdin.write('h');
    await expectFrame(instance, '>   - orders');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - audit');
    instance.stdin.write('\r');
    await expectFrame(instance, 'audit data');

    instance.stdin.write('\x1B[Z');
    await expectFrame(instance, '[ admin.orders ]');
    expect(instance.lastFrame()).toContain('orders data');

    instance.stdin.write('\t');
    await expectFrame(instance, '[ admin.audit ]');
    expect(instance.lastFrame()).toContain('audit data');

    instance.stdin.write('\t');
    await expectFrame(instance, '[ admin.users ]');
    expect(instance.lastFrame()).toContain('users data');

    instance.stdin.write('\x1B[Z');
    await expectFrame(instance, '[ admin.audit ]');
    expect(instance.lastFrame()).toContain('audit data');
    expect(loadCollectionDocuments).toHaveBeenCalledTimes(3);
  });

  it('closes the active tab and shows an empty state after closing the last tab', async () => {
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users', 'orders']}
        loadCollectionDocuments={async (
          url: string,
          databaseName: string,
          collectionName: string,
        ) => {
          void url;
          void databaseName;

          return [{_id: collectionName, name: collectionName}];
        }}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, '_id: users');
    expect(instance.lastFrame()).not.toContain('Document 1');
    instance.stdin.write('h');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - orders');
    instance.stdin.write('\r');
    await expectFrame(instance, '_id: orders');

    instance.stdin.write('x');
    await vi.waitFor(() => {
      expect(instance.lastFrame()).toContain('admin.users');
      expect(instance.lastFrame()).not.toContain('admin.orders');
    });

    instance.stdin.write('x');
    await expectFrame(instance, 'No open document tabs.');
    expect(instance.lastFrame()).toContain('Tabs: none');
  });
});

async function openCollection(
  instance: ReturnType<typeof render>,
  collectionName: string,
): Promise<void> {
  await expectFrame(instance, 'Saved connections');
  instance.stdin.write('\r');
  await expectFrame(instance, 'Databases loaded.');
  instance.stdin.write('\r');
  await expectFrame(instance, `- ${collectionName}`);
  instance.stdin.write('j');
  await expectFrame(instance, `>   - ${collectionName}`);
  instance.stdin.write('\r');
}

async function expectFrame(
  instance: ReturnType<typeof render>,
  text: string,
): Promise<void> {
  await vi.waitFor(() => {
    expect(instance.lastFrame()).toContain(text);
  });
}

function countOccurrences(value: string, searchValue: string): number {
  return value.split(searchValue).length - 1;
}

function mongoConnection(name: string, url: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url},
  };
}
