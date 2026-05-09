import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App create document shortcut', () => {
  it('starts creation with a and submits valid JSON for the active collection tab', async () => {
    const insertCollectionDocument = vi.fn(async () => undefined);
    const loadCollectionDocuments = vi.fn(async () => [
      {_id: 'server-id', name: 'Ada'},
    ]);
    const instance = render(
      <App
        insertCollectionDocument={insertCollectionDocument}
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={loadCollectionDocuments}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, 'name: Ada');
    instance.stdin.write('a');
    await expectFrame(instance, 'New document: admin.users');
    replaceDraftText(instance, '{"name":"Grace"}');
    instance.stdin.write('\r');
    await expectFrame(instance, 'server-id');

    expect(insertCollectionDocument).toHaveBeenCalledWith(
      'mongodb://example',
      'admin',
      'users',
      {name: 'Grace'},
    );
    expect(loadCollectionDocuments).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid JSON and keeps the editor open without inserting', async () => {
    const insertCollectionDocument = vi.fn(async () => undefined);
    const instance = render(
      <App
        insertCollectionDocument={insertCollectionDocument}
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => [{_id: '1'}]}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, '_id: 1');
    instance.stdin.write('a');
    await expectFrame(instance, 'New document: admin.users');
    replaceDraftText(instance, 'not-json');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Document must be valid JSON.');

    expect(instance.lastFrame()).toContain('New document: admin.users');
    expect(insertCollectionDocument).not.toHaveBeenCalled();
  });

  it('cancels creation with Escape without inserting', async () => {
    const insertCollectionDocument = vi.fn(async () => undefined);
    const instance = render(
      <App
        insertCollectionDocument={insertCollectionDocument}
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => [{_id: '1', name: 'Ada'}]}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, 'name: Ada');
    instance.stdin.write('a');
    await expectFrame(instance, 'New document: admin.users');
    instance.stdin.write('\x1B');
    await expectFrame(instance, 'name: Ada');

    expect(instance.lastFrame()).not.toContain('New document');
    expect(insertCollectionDocument).not.toHaveBeenCalled();
  });

  it('shows insertion errors and allows the draft to stay editable', async () => {
    const insertCollectionDocument = vi.fn(async () => {
      throw new Error('insert failed');
    });
    const instance = render(
      <App
        insertCollectionDocument={insertCollectionDocument}
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        loadCollectionDocuments={async () => [{_id: '1'}]}
      />,
    );

    await openCollection(instance, 'users');
    await expectFrame(instance, '_id: 1');
    instance.stdin.write('a');
    await expectFrame(instance, 'New document: admin.users');
    replaceDraftText(instance, '{"name":"Grace"}');
    instance.stdin.write('\r');
    await expectFrame(
      instance,
      'Unable to insert document into the selected collection.',
    );

    expect(instance.lastFrame()).toContain('{"name":"Grace"}');
  });
});

function replaceDraftText(
  instance: ReturnType<typeof render>,
  text: string,
): void {
  instance.stdin.write('\x7F');
  instance.stdin.write('\x7F');
  instance.stdin.write(text);
}

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

function mongoConnection(name: string, url: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url},
  };
}
