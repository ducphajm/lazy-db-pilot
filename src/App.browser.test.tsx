import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {
  MongoBrowserLayout,
  getBrowserContentHeight,
  getVisibleSidebarItems,
  getVisibleSidebarRowCount,
} from './app/MongoBrowserLayout.js';
import {
  MongoBrowserContainer,
  MongoBrowserSidebarItemType,
  type MongoBrowserSidebarItem,
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

  it('expands multiple databases with their own collections', async () => {
    const loadCollections = vi.fn(async (_url: string, databaseName: string) =>
      databaseName === 'admin' ? ['users'] : ['events'],
    );
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin', 'analytics']}
        loadCollections={loadCollections}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('\r');
    await expectFrame(instance, '- users');
    instance.stdin.write('j');
    instance.stdin.write('j');
    await expectFrame(instance, '> [+] analytics');
    instance.stdin.write('l');
    await expectFrame(instance, '- events');

    const frame = instance.lastFrame() ?? '';
    expect(frame).toContain('[-] admin');
    expect(frame).toContain('- users');
    expect(frame).toContain('[-] analytics');
    expect(frame).toContain('- events');
    expect(loadCollections).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
    );
    expect(loadCollections).toHaveBeenCalledWith(
      'mongodb://example',
      'analytics',
    );
  });

  it('closes one expanded database without closing another', async () => {
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin', 'analytics']}
        loadCollections={async (_url, databaseName) =>
          databaseName === 'admin' ? ['users'] : ['events']
        }
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\r');
    await expectFrame(instance, '> [+] admin');
    instance.stdin.write('\r');
    await expectFrame(instance, '- users');
    instance.stdin.write('j');
    instance.stdin.write('j');
    await expectFrame(instance, '> [+] analytics');
    instance.stdin.write('l');
    await expectFrame(instance, '- events');
    instance.stdin.write('k');
    instance.stdin.write('k');
    await expectFrame(instance, '> [-] admin');
    instance.stdin.write('h');
    await expectFrame(instance, '> [+] admin');

    const frame = instance.lastFrame() ?? '';
    expect(frame).not.toContain('- users');
    expect(frame).toContain('[-] analytics');
    expect(frame).toContain('- events');
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
        createDocumentDraft={null}
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
        onCancelCreateDocument={() => {}}
        onSubmitCreateDocument={() => {}}
        onUpdateCreateDocumentText={() => {}}
      />,
    );

    await expectFrame(instance, `>   - ${collectionName}`);
    expect(instance.lastFrame()).not.toContain('...');
  });

  it('keeps the selected sidebar item inside the visible row slice', () => {
    const sidebarItems: MongoBrowserSidebarItem[] = Array.from(
      {length: 12},
      (_value, index) => ({
        databaseName: `db${index}`,
        key: `database:db${index}`,
        label: `[+] db${index}`,
        type: MongoBrowserSidebarItemType.Database,
      }),
    );

    const visibleItems = getVisibleSidebarItems({
      items: sidebarItems,
      selectedIndex: 10,
      visibleRowCount: 4,
    });

    expect(visibleItems.map(item => item.key)).toEqual([
      'database:db7',
      'database:db8',
      'database:db9',
      'database:db10',
    ]);
  });

  it('reserves sidebar row capacity for pane chrome and feedback', () => {
    expect(getVisibleSidebarRowCount(10, AppPhase.CollectionsLoaded)).toBe(7);
    expect(getVisibleSidebarRowCount(10, AppPhase.LoadingCollections)).toBe(6);
    expect(getVisibleSidebarRowCount(undefined, AppPhase.CollectionsLoaded))
      .toBeUndefined();
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
