import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {
  MongoBrowserLayout,
  getBrowserContentHeight,
} from './app/MongoBrowserLayout.js';
import {
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
} from './app/mongodbBrowser.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';
import {AppPhase} from './app/phases.js';

afterEach(() => {
  cleanup();
});

describe('MongoDB split browser', () => {
  it('caps browser content height to leave surrounding screen chrome visible', () => {
    expect(getBrowserContentHeight(24)).toBe(20);
    expect(getBrowserContentHeight(6)).toBe(5);
    expect(getBrowserContentHeight(undefined)).toBeUndefined();
  });

  it('moves focus between browser containers with Ctrl+h/j/k/l', async () => {
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => [
          {_id: '1', name: 'Ada'},
          {_id: '2', name: 'Grace'},
        ]}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('\r');
    await expectFrame(instance, '- users');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('\r');
    await expectFrame(instance, '_id: 1');

    instance.stdin.write('\b');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('j');
    await expectFrame(instance, '> [-] admin');
    expect(instance.lastFrame()).not.toContain('Document 1');

    instance.stdin.write('\n');
    await expectFrame(instance, '> [-] admin');
    instance.stdin.write('\f');
    await expectFrame(instance, 'name: Ada');
    instance.stdin.write('j');
    await expectFrame(instance, 'name: Grace');
    instance.stdin.write('\v');
    await expectFrame(instance, 'name: Grace');
  });

  it('closes and opens database folders and returns to saved connections', async () => {
    const loadCollections = vi.fn(async () => ['users']);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={loadCollections}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('l');
    await expectFrame(instance, '> [-] admin');
    expect(instance.lastFrame()).toContain('- users');

    instance.stdin.write('h');
    await expectFrame(instance, '> [+] admin');
    expect(instance.lastFrame()).not.toContain('- users');
    instance.stdin.write('l');
    await expectFrame(instance, '- users');
    expect(loadCollections).toHaveBeenCalledTimes(2);

    instance.stdin.write('\b');
    await expectFrame(instance, 'Saved connections');
  });

  it('renders long collection names as single-line ellipsized sidebar items', async () => {
    const longCollectionName = 'verylongnameevergrowingcollection';
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => [longCollectionName]}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('\r');
    await expectFrame(instance, '  - verylongnameevergro...');

    const frame = instance.lastFrame() ?? '';
    expect(frame).not.toContain(longCollectionName);
    expect(linesContaining(frame, 'verylongnameevergro...')).toHaveLength(1);
  });

  it('opens an ellipsized collection using its full collection name', async () => {
    const longCollectionName = 'verylongnameevergrowingcollection';
    const loadCollectionDocuments = vi.fn(async () => [
      {_id: 'long-collection-document'},
    ]);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => [longCollectionName]}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('\r');
    await expectFrame(instance, '  - verylongnameevergro...');
    instance.stdin.write('j');
    await expectFrame(instance, '>   - verylongnameevergro...');
    instance.stdin.write('\r');
    await expectFrame(instance, '_id: long-collection-document');

    expect(loadCollectionDocuments).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
      longCollectionName,
    );
  });

  it('renders the full collection name in a wider sidebar', async () => {
    const collectionName = 'verylongnameevergrowingcollection';
    const instance = render(
      <MongoBrowserLayout
        activeContainer={MongoBrowserContainer.LeftSidebar}
        activeDocumentTab={null}
        documentTabs={[]}
        leftPaneWidth={64}
        operationError={null}
        phase={AppPhase.CollectionsLoaded}
        selectedSidebarIndex={1}
        sidebarItems={[
          {
            databaseName: 'admin',
            key: 'database:admin',
            label: '[-] admin',
            type: MongoBrowserSidebarItemType.Database,
          },
          {
            collectionName,
            databaseName: 'admin',
            key: `collection:admin:${collectionName}`,
            label: `  - ${collectionName}`,
            type: MongoBrowserSidebarItemType.Collection,
          },
        ]}
      />,
    );

    await expectFrame(instance, `>   - ${collectionName}`);
    expect(instance.lastFrame()).not.toContain('...');
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

function mongoConnection(name: string, url: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url},
  };
}

function linesContaining(value: string, searchValue: string): string[] {
  return value.split('\n').filter(line => line.includes(searchValue));
}
