import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App quit confirmation', () => {
  it('opens confirmation with q, cancels with n, and confirms with y', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        onExit={onExit}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('q');
    await expectFrame(instance, 'Quit application?');
    await expectFrame(instance, '> Quit');
    await expectFrame(instance, '  Cancel');
    expect(onExit).not.toHaveBeenCalled();

    instance.stdin.write('n');
    await expectMissingFrame(instance, 'Quit application?');
    expect(onExit).not.toHaveBeenCalled();

    instance.stdin.write('q');
    await expectFrame(instance, 'Quit application?');
    instance.stdin.write('y');

    await vi.waitFor(() => {
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });

  it('allows selecting cancel from the quit modal', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        onExit={onExit}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('q');
    await expectFrame(instance, '> Quit');

    instance.stdin.write('j');
    await expectFrame(instance, '> Cancel');
    instance.stdin.write('\r');

    await expectMissingFrame(instance, 'Quit application?');
    await expectFrame(instance, 'Saved connections');
    expect(onExit).not.toHaveBeenCalled();
  });

  it('allows selecting quit from the quit modal', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        onExit={onExit}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('q');
    await expectFrame(instance, '> Quit');
    instance.stdin.write('\r');

    await vi.waitFor(() => {
      expect(onExit).toHaveBeenCalledTimes(1);
    });
  });

  it('allows q in the connection form without opening confirmation', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App loadConnectionsList={async () => []} onExit={onExit} />,
    );

    await expectFrame(instance, 'Connection form');
    instance.stdin.write('q');
    await expectFrame(instance, 'Name: q');

    expect(instance.lastFrame()).not.toContain('Quit application?');
    expect(onExit).not.toHaveBeenCalled();
  });

  it('does not exit with Ctrl+C', async () => {
    const onExit = vi.fn();
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Local Mongo', 'mongodb://example'),
        ]}
        onExit={onExit}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('\x03');

    expect(onExit).not.toHaveBeenCalled();
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

async function expectMissingFrame(
  instance: ReturnType<typeof render>,
  text: string,
): Promise<void> {
  await vi.waitFor(() => {
    expect(instance.lastFrame()).not.toContain(text);
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
