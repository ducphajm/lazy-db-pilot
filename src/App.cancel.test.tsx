import React from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {cleanup, render} from 'ink-testing-library';
import {App} from './App.js';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';
import type {DatabaseConnection} from './connections/types.js';

afterEach(() => {
  cleanup();
});

describe('App connection creation cancellation', () => {
  it('returns to saved connections without saving when creation is canceled', async () => {
    const saveConnection = vi.fn(async () => []);
    const instance = render(
      <App
        loadConnectionsList={async () => [
          mongoConnection('Existing', 'mongodb://example'),
        ]}
        saveConnection={saveConnection}
      />,
    );

    await expectFrame(instance, 'Saved connections');
    instance.stdin.write('j');
    await expectFrame(instance, '> Create connection');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection form');
    expect(instance.lastFrame()).toContain('Press Escape to cancel');

    instance.stdin.write('Draft Name');
    await expectFrame(instance, 'Name: Draft Name');
    instance.stdin.write('\u001B');

    await expectFrame(instance, 'Saved connections');
    expect(instance.lastFrame()).toContain('Existing [mongodb/local]');
    expect(instance.lastFrame()).not.toContain('Draft Name');
    expect(saveConnection).not.toHaveBeenCalled();
  });

  it('clears the form and validation error without saving when no saved connections exist', async () => {
    const saveConnection = vi.fn(async () => []);
    const instance = render(
      <App loadConnectionsList={async () => []} saveConnection={saveConnection} />,
    );

    await expectFrame(instance, 'Connection form');
    expect(instance.lastFrame()).toContain('Press Escape to cancel');

    instance.stdin.write('Draft Name');
    await expectFrame(instance, 'Name: Draft Name');
    instance.stdin.write('\r');
    await expectFrame(instance, 'Connection details are incomplete.');
    instance.stdin.write('\u001B');

    await expectFrame(instance, 'Name: required');
    expect(instance.lastFrame()).not.toContain('Draft Name');
    expect(instance.lastFrame()).not.toContain('Connection details are incomplete.');
    expect(saveConnection).not.toHaveBeenCalled();
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
