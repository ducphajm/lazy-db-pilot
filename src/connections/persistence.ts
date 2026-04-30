import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateConnection, parseConnectionRecord} from './validation.js';
import type {ConnectionInput, DatabaseConnection} from './types.js';

const appDirectoryName = '.lazy-db-pilot';
const connectionsFileName = 'connections.json';

export type ConnectionStoreOptions = {
  readonly directory?: string;
};

export async function loadConnections({
  directory = getDefaultConnectionDirectory(),
}: ConnectionStoreOptions = {}): Promise<DatabaseConnection[]> {
  const filePath = getConnectionsFilePath(directory);
  const content = await readConnectionsFile(filePath);

  if (content === null) {
    return [];
  }

  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    return [];
  }

  const connections: DatabaseConnection[] = [];
  const names = new Set<string>();

  for (const record of parsed) {
    try {
      const connection = parseConnectionRecord(record);

      if (!names.has(connection.name)) {
        names.add(connection.name);
        connections.push(connection);
      }
    } catch {
      continue;
    }
  }

  return connections;
}

export async function addConnection(
  input: ConnectionInput,
  options: ConnectionStoreOptions = {},
): Promise<DatabaseConnection[]> {
  const connections = await loadConnections(options);
  const connection = validateConnection(input, connections);
  const nextConnections = [...connections, connection];

  await saveConnections(nextConnections, options);

  return nextConnections;
}

export async function saveConnections(
  connections: readonly DatabaseConnection[],
  {directory = getDefaultConnectionDirectory()}: ConnectionStoreOptions = {},
): Promise<void> {
  await mkdir(directory, {recursive: true});

  const filePath = getConnectionsFilePath(directory);
  const tempFilePath = `${filePath}.tmp`;
  const content = `${JSON.stringify(connections, null, 2)}\n`;

  await writeFile(tempFilePath, content, 'utf8');
  await rename(tempFilePath, filePath);
}

export function getDefaultConnectionDirectory(): string {
  return path.join(os.homedir(), appDirectoryName);
}

export function getConnectionsFilePath(directory: string): string {
  return path.join(directory, connectionsFileName);
}

async function readConnectionsFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
