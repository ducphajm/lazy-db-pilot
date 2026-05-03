import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  addConnection,
  deleteConnection,
  getConnectionsFilePath,
  loadConnections,
  saveConnections,
} from './persistence.js';
import {ConnectionEnvironment, DatabaseType} from './types.js';
import type {DatabaseConnection} from './types.js';

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'lazy-db-pilot-'));
});

afterEach(async () => {
  await rm(directory, {force: true, recursive: true});
});

describe('connection persistence', () => {
  it('returns an empty list when no file exists', async () => {
    await expect(loadConnections({directory})).resolves.toEqual([]);
  });

  it('creates the directory and writes connection records as JSON', async () => {
    await saveConnections(
      [
        {
          name: 'Local Mongo',
          type: DatabaseType.MongoDB,
          environment: ConnectionEnvironment.Local,
          details: {url: 'mongodb://localhost:27017'},
        },
      ],
      {directory},
    );

    await expect(loadConnections({directory})).resolves.toEqual([
      {
        name: 'Local Mongo',
        type: DatabaseType.MongoDB,
        environment: ConnectionEnvironment.Local,
        details: {url: 'mongodb://localhost:27017'},
      },
    ]);
  });

  it('adds valid connections after checking duplicate names', async () => {
    await addConnection(
      {
        name: 'Redis',
        type: DatabaseType.Redis,
        environment: ConnectionEnvironment.Development,
        details: {},
      },
      {directory},
    );

    await expect(
      addConnection(
        {
          name: 'Redis',
          type: DatabaseType.SQLite,
          environment: ConnectionEnvironment.Local,
          details: {},
        },
        {directory},
      ),
    ).rejects.toThrow('Connection name must be unique.');
  });

  it('skips invalid records while loading', async () => {
    await writeFile(
      getConnectionsFilePath(directory),
      JSON.stringify([
        {
          name: 'Local Mongo',
          type: DatabaseType.MongoDB,
          environment: ConnectionEnvironment.Local,
          details: {url: 'mongodb://localhost:27017'},
        },
        {
          name: 'Bad',
          type: 'mysql',
          environment: ConnectionEnvironment.Local,
          details: {},
        },
      ]),
      'utf8',
    );

    await expect(loadConnections({directory})).resolves.toHaveLength(1);
  });

  it('writes through a temp file and renames into place', async () => {
    await saveConnections([], {directory});

    await expect(readFile(getConnectionsFilePath(directory), 'utf8')).resolves
      .toBe('[]\n');
  });

  it('deletes one connection by exact name', async () => {
    await saveConnections(
      [
        connection('Local Mongo', DatabaseType.MongoDB),
        connection('Redis', DatabaseType.Redis),
      ],
      {directory},
    );

    await expect(deleteConnection('Local Mongo', {directory})).resolves.toEqual([
      connection('Redis', DatabaseType.Redis),
    ]);
    await expect(loadConnections({directory})).resolves.toEqual([
      connection('Redis', DatabaseType.Redis),
    ]);
  });

  it('deletes the last connection', async () => {
    await saveConnections([connection('Redis', DatabaseType.Redis)], {directory});

    await expect(deleteConnection('Redis', {directory})).resolves.toEqual([]);
    await expect(readFile(getConnectionsFilePath(directory), 'utf8')).resolves
      .toBe('[]\n');
  });

  it('leaves records unchanged when deleting an absent name', async () => {
    const records = [
      connection('Local Mongo', DatabaseType.MongoDB),
      connection('Redis', DatabaseType.Redis),
    ];

    await saveConnections(records, {directory});

    await expect(deleteConnection('Missing', {directory})).resolves.toEqual(
      records,
    );
    await expect(loadConnections({directory})).resolves.toEqual(records);
  });
});

function connection(name: string, type: DatabaseType): DatabaseConnection {
  switch (type) {
    case DatabaseType.MongoDB:
      return {
        name,
        type,
        environment: ConnectionEnvironment.Local,
        details: {url: 'mongodb://localhost:27017'},
      };
    case DatabaseType.Redis:
      return {
        name,
        type,
        environment: ConnectionEnvironment.Local,
        details: {},
      };
    case DatabaseType.SQLite:
      return {
        name,
        type,
        environment: ConnectionEnvironment.Local,
        details: {},
      };
  }

  throw new Error(`Unsupported database type: ${type satisfies never}`);
}
