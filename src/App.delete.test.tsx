import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App connection deletion', () => {
  it('shows confirmation before deleting a saved connection', async () => {
    const deleteConnectionByName = vi.fn(async () => [
      redisConnection('Redis'),
    ]);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo'),
          redisConnection('Redis'),
        ]}
        deleteConnectionByName={deleteConnectionByName}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    expect(instance.lastFrame()).toContain('d delete');
    instance.stdin.write('d');

    await expectFrame(instance, 'Delete saved connection Local Mongo?');
    expect(deleteConnectionByName).not.toHaveBeenCalled();
  });

  it('cancels connection deletion', async () => {
    const deleteConnectionByName = vi.fn(async () => []);
    const instance = render(
      <App
        loadConnectionsList={async () => [mongoConnection('Local Mongo')]}
        deleteConnectionByName={deleteConnectionByName}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('d');
    await expectFrame(instance, 'Delete saved connection Local Mongo?');
    instance.stdin.write('j');
    await expectFrame(instance, '> Cancel');
    instance.stdin.write('\r');

    await expectFrame(instance, 'Local Mongo [mongodb/local]');
    expect(deleteConnectionByName).not.toHaveBeenCalled();
  });

  it('deletes a saved connection and refreshes the list', async () => {
    const deleteConnectionByName = vi.fn(async () => [redisConnection('Redis')]);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo'),
          redisConnection('Redis'),
        ]}
        deleteConnectionByName={deleteConnectionByName}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('d');
    await expectFrame(instance, 'Delete saved connection Local Mongo?');
    instance.stdin.write('\r');

    await expectFrame(instance, 'Redis [redis/local]');
    expect(instance.lastFrame()).not.toContain('Local Mongo [mongodb/local]');
    expect(deleteConnectionByName).toHaveBeenCalledWith('Local Mongo');
  });

  it('routes to connection creation after deleting the last connection', async () => {
    const deleteConnectionByName = vi.fn(async () => []);
    const instance = render(
      <App
        loadConnectionsList={async () => [mongoConnection('Local Mongo')]}
        deleteConnectionByName={deleteConnectionByName}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('d');
    await expectFrame(instance, 'Delete saved connection Local Mongo?');
    instance.stdin.write('\r');

    await expectFrame(instance, 'Connection form');
    expect(deleteConnectionByName).toHaveBeenCalledWith('Local Mongo');
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

function mongoConnection(name: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.MongoDB,
    environment: ConnectionEnvironment.Local,
    details: {url: 'mongodb://example'},
  };
}

function redisConnection(name: string): DatabaseConnection {
  return {
    name,
    type: DatabaseType.Redis,
    environment: ConnectionEnvironment.Local,
    details: {},
  };
}
