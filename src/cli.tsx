#!/usr/bin/env node
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {render} from 'ink';
import {App} from './App.js';

enum AnsiControl {
  EnterAlternateScreen = '\u001B[?1049h',
  ExitAlternateScreen = '\u001B[?1049l',
}

type CliOptions = {
  readonly stdout?: NodeJS.WriteStream;
};

export async function startCli({
  stdout = process.stdout,
}: CliOptions = {}): Promise<void> {
  stdout.write(AnsiControl.EnterAlternateScreen);

  try {
    const instance = render(<App />, {
      exitOnCtrlC: false,
      stdout,
    });

    await instance.waitUntilExit();
  } finally {
    stdout.write(AnsiControl.ExitAlternateScreen);
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  void startCli();
}
