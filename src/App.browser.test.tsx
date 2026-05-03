import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('MongoDB split browser', () => {
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
    await expectFrame(instance, '> Document 1');

    instance.stdin.write('\b');
    await expectFrame(instance, '>   - users');
    instance.stdin.write('j');
    await expectFrame(instance, '> [-] admin');
    expect(instance.lastFrame()).toContain('Document 1');

    instance.stdin.write('\n');
    await expectFrame(instance, '> [-] admin');
    instance.stdin.write('\f');
    await expectFrame(instance, '> Document 1');
    instance.stdin.write('j');
    await expectFrame(instance, '> Document 2');
    instance.stdin.write('\v');
    await expectFrame(instance, '> Document 2');
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
