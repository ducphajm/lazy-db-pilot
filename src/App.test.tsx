import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {MongoOperation, MongoServiceError} from './mongodb/errors.js';

afterEach(() => {
  cleanup();
});

describe('App', () => {
  it('rejects empty MongoDB URL submissions', async () => {
    const instance = render(<App />);

    instance.stdin.write('\r');

    await expectFrame(instance, 'MongoDB URL is required.');
  });

  it('loads databases, selects a database, and renders collections', async () => {
    const loadDatabases = vi.fn(async () => ['admin', 'app']);
    const loadCollections = vi.fn(async () => ['users', 'orders']);
    const instance = render(
      <App loadDatabases={loadDatabases} loadCollections={loadCollections} />,
    );

    await submitInput(instance, 'mongodb://user:secret@example');

    await expectFrame(instance, 'Databases loaded.');
    expect(instance.lastFrame()).not.toContain('secret');

    instance.stdin.write('\r');

    await expectFrame(instance, 'Collections in admin');
    expect(instance.lastFrame()).toContain('- users');
    expect(instance.lastFrame()).toContain('- orders');
    expect(loadCollections).toHaveBeenCalledWith(
      'mongodb://user:secret@example',
      'admin',
    );
    expect(instance.lastFrame()).not.toContain(
      'mongodb://user:secret@example',
    );
  });

  it('renders an empty database state and retries with a new URL', async () => {
    const loadDatabases = vi.fn(async () => []);
    const instance = render(<App loadDatabases={loadDatabases} />);

    await submitInput(instance, 'mongodb://example');

    await expectFrame(instance, 'No databases are available');

    instance.stdin.write('\r');

    await expectFrame(instance, 'MongoDB URL');
  });

  it('renders an empty collection state', async () => {
    const loadDatabases = vi.fn(async () => ['app']);
    const loadCollections = vi.fn(async () => []);
    const instance = render(
      <App loadDatabases={loadDatabases} loadCollections={loadCollections} />,
    );

    await submitInput(instance, 'mongodb://example');

    await expectFrame(instance, 'Databases loaded.');

    instance.stdin.write('\r');

    await expectFrame(instance, 'No collections found.');
  });

  it('allows q to be typed into the MongoDB URL prompt', async () => {
    const onExit = vi.fn();
    const instance = render(<App onExit={onExit} />);

    instance.stdin.write('mongodb://q-host');

    await expectFrame(instance, 'mongodb://q-host');
    expect(onExit).not.toHaveBeenCalled();
  });

  it('quits with Ctrl+C from the MongoDB URL prompt', async () => {
    const onExit = vi.fn();
    const instance = render(<App onExit={onExit} />);

    instance.stdin.write('\u0003');

    await expectCallback(onExit);
  });

  it('quits with q from the database list', async () => {
    const loadDatabases = vi.fn(async () => ['admin']);
    const onExit = vi.fn();
    const instance = render(
      <App loadDatabases={loadDatabases} onExit={onExit} />,
    );

    await submitInput(instance, 'mongodb://example');
    await expectFrame(instance, 'Databases loaded.');

    instance.stdin.write('q');

    await expectCallback(onExit);
  });

  it('quits with q and Ctrl+C from loading states', async () => {
    const onExitFromDatabaseLoading = vi.fn();
    const databaseLoadingInstance = render(
      <App
        loadDatabases={() => new Promise<string[]>(() => {})}
        onExit={onExitFromDatabaseLoading}
      />,
    );

    await submitInput(databaseLoadingInstance, 'mongodb://example');
    await expectFrame(databaseLoadingInstance, 'Loading databases');

    databaseLoadingInstance.stdin.write('q');

    await expectCallback(onExitFromDatabaseLoading);
    databaseLoadingInstance.unmount();

    const onExitFromCollectionLoading = vi.fn();
    const collectionLoadingInstance = render(
      <App
        loadDatabases={async () => ['admin']}
        loadCollections={() => new Promise<string[]>(() => {})}
        onExit={onExitFromCollectionLoading}
      />,
    );

    await submitInput(collectionLoadingInstance, 'mongodb://example');
    await expectFrame(collectionLoadingInstance, 'Databases loaded.');

    collectionLoadingInstance.stdin.write('\r');
    await expectFrame(collectionLoadingInstance, 'Loading collections');

    collectionLoadingInstance.stdin.write('\u0003');

    await expectCallback(onExitFromCollectionLoading);
  });

  it('quits with q from loaded and empty collection result states', async () => {
    const onExitFromLoadedCollections = vi.fn();
    const loadedCollectionsInstance = render(
      <App
        loadDatabases={async () => ['admin']}
        loadCollections={async () => ['users']}
        onExit={onExitFromLoadedCollections}
      />,
    );

    await submitInput(loadedCollectionsInstance, 'mongodb://example');
    await expectFrame(loadedCollectionsInstance, 'Databases loaded.');
    loadedCollectionsInstance.stdin.write('\r');
    await expectFrame(loadedCollectionsInstance, 'Collections in admin');

    loadedCollectionsInstance.stdin.write('q');

    await expectCallback(onExitFromLoadedCollections);

    const onExitFromEmptyCollections = vi.fn();
    const emptyCollectionsInstance = render(
      <App
        loadDatabases={async () => ['admin']}
        loadCollections={async () => []}
        onExit={onExitFromEmptyCollections}
      />,
    );

    await submitInput(emptyCollectionsInstance, 'mongodb://example');
    await expectFrame(emptyCollectionsInstance, 'Databases loaded.');
    emptyCollectionsInstance.stdin.write('\r');
    await expectFrame(emptyCollectionsInstance, 'No collections found.');

    emptyCollectionsInstance.stdin.write('q');

    await expectCallback(onExitFromEmptyCollections);
  });

  it('returns from loaded collections to the existing database list', async () => {
    const loadDatabases = vi.fn(async () => ['admin', 'app']);
    const loadCollections = vi.fn(async () => ['users']);
    const instance = render(
      <App loadDatabases={loadDatabases} loadCollections={loadCollections} />,
    );

    await submitInput(instance, 'mongodb://user:secret@example');
    await expectFrame(instance, 'Databases loaded.');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Collections in admin');

    instance.stdin.write('h');

    await expectFrame(instance, 'Select a database');
    expect(instance.lastFrame()).toContain('admin');
    expect(instance.lastFrame()).toContain('app');
    expect(instance.lastFrame()).not.toContain('MongoDB URL');
    expect(loadDatabases).toHaveBeenCalledTimes(1);
  });

  it('returns from empty collections to the existing database list', async () => {
    const loadDatabases = vi.fn(async () => ['admin']);
    const loadCollections = vi.fn(async () => []);
    const instance = render(
      <App loadDatabases={loadDatabases} loadCollections={loadCollections} />,
    );

    await submitInput(instance, 'mongodb://example');
    await expectFrame(instance, 'Databases loaded.');
    instance.stdin.write('\r');
    await expectFrame(instance, 'No collections found.');

    instance.stdin.write('h');

    await expectFrame(instance, 'Select a database');
    expect(instance.lastFrame()).not.toContain('MongoDB URL');
    expect(loadDatabases).toHaveBeenCalledTimes(1);
  });

  it('selects the focused database with l', async () => {
    const loadDatabases = vi.fn(async () => ['admin', 'app']);
    const loadCollections = vi.fn(async () => ['users']);
    const instance = render(
      <App loadDatabases={loadDatabases} loadCollections={loadCollections} />,
    );

    await submitInput(instance, 'mongodb://example');
    await expectFrame(instance, 'Databases loaded.');

    instance.stdin.write('\u001B[B');
    await expectFrame(instance, '> app');
    instance.stdin.write('l');

    await expectFrame(instance, 'Collections in app');
    expect(loadCollections).toHaveBeenCalledWith('mongodb://example', 'app');
  });

  it('renders credential-safe errors and allows retry', async () => {
    const loadDatabases = vi.fn(async () => {
      throw new MongoServiceError(
        MongoOperation.ListDatabases,
        new Error('mongodb://user:secret@example failed'),
      );
    });
    const instance = render(<App loadDatabases={loadDatabases} />);

    await submitInput(instance, 'mongodb://user:secret@example');

    await expectFrame(
      instance,
      'Unable to connect to MongoDB or list databases.',
    );
    expect(instance.lastFrame()).not.toContain('secret');

    instance.stdin.write('\r');

    await expectFrame(instance, 'MongoDB URL');
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

async function submitInput(
  instance: ReturnType<typeof render>,
  input: string,
): Promise<void> {
  instance.stdin.write(input);
  await expectFrame(instance, input);
  instance.stdin.write('\r');
}
