import React from 'react';
import type {Instance, RenderOptions} from 'ink';
import {render} from 'ink';
import {describe, expect, it, vi} from 'vitest';
import {App} from './App.js';
import {startCli} from './cli.js';

vi.mock('ink', async importOriginal => {
  const actual = await importOriginal<typeof import('ink')>();

  return {
    ...actual,
    render: vi.fn(),
  };
});

describe('CLI entrypoint', () => {
  it('renders the app inside a fullscreen terminal session', async () => {
    const waitUntilExit = vi.fn(async () => undefined);
    const write = vi.fn();
    const stdout = {write} as unknown as NodeJS.WriteStream;
    const instance = createInkInstance(waitUntilExit);

    vi.mocked(render).mockReturnValue(instance);

    await startCli({stdout});

    expect(write).toHaveBeenNthCalledWith(1, '\u001B[?1049h');
    expect(render).toHaveBeenCalledWith(expectReactElement(App), {
      exitOnCtrlC: false,
      stdout,
    } satisfies RenderOptions);
    expect(waitUntilExit).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenNthCalledWith(2, '\u001B[?1049l');
  });

  it('exits fullscreen when the Ink app rejects', async () => {
    const error = new Error('render failed');
    const waitUntilExit = vi.fn(async () => {
      throw error;
    });
    const write = vi.fn();
    const stdout = {write} as unknown as NodeJS.WriteStream;

    vi.mocked(render).mockReturnValue(createInkInstance(waitUntilExit));

    await expect(startCli({stdout})).rejects.toThrow(error);
    expect(write).toHaveBeenNthCalledWith(1, '\u001B[?1049h');
    expect(write).toHaveBeenNthCalledWith(2, '\u001B[?1049l');
  });

  it('exits fullscreen when Ink render throws', async () => {
    const error = new Error('render failed');
    const write = vi.fn();
    const stdout = {write} as unknown as NodeJS.WriteStream;

    vi.mocked(render).mockImplementationOnce(() => {
      throw error;
    });

    await expect(startCli({stdout})).rejects.toThrow(error);
    expect(write).toHaveBeenNthCalledWith(1, '\u001B[?1049h');
    expect(write).toHaveBeenNthCalledWith(2, '\u001B[?1049l');
  });
});

function createInkInstance(waitUntilExit: Instance['waitUntilExit']): Instance {
  return {
    cleanup: vi.fn(),
    clear: vi.fn(),
    rerender: vi.fn(),
    unmount: vi.fn(),
    waitUntilExit,
  };
}

function expectReactElement(type: typeof App): React.JSX.Element {
  return expect.objectContaining({type}) as React.JSX.Element;
}
