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

async function submitInput(
  instance: ReturnType<typeof render>,
  input: string,
): Promise<void> {
  instance.stdin.write(input);
  await expectFrame(instance, input);
  instance.stdin.write('\r');
}
