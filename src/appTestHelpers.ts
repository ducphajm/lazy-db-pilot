import type {render} from 'ink-testing-library';
import {expect, vi} from 'vitest';
import {ConnectionEnvironment, DatabaseType} from './connections/types.js';

type AppRender = ReturnType<typeof render>;

export async function fillConnectionForm(
  instance: AppRender,
  connection: {
    readonly name: string;
    readonly type: DatabaseType;
    readonly environment: ConnectionEnvironment;
    readonly mongoUrl?: string;
  },
): Promise<void> {
  await expectFrame(instance, 'Connection form');
  instance.stdin.write(connection.name);
  await expectFrame(instance, `Name: ${connection.name}`);
  await selectConnectionType(instance, connection.type);
  await selectConnectionEnvironment(instance, connection.environment);

  if (connection.type === DatabaseType.MongoDB) {
    instance.stdin.write('\t');
    await expectFrame(instance, '> MongoDB URL');
    instance.stdin.write(connection.mongoUrl ?? '');
    await expectFrame(instance, connection.mongoUrl ?? '');
  }

  instance.stdin.write('\r');
}

export async function selectConnectionType(
  instance: AppRender,
  type: DatabaseType,
): Promise<void> {
  instance.stdin.write('\t');
  await expectFrame(instance, '> Database');

  const stepsByType: Readonly<Record<DatabaseType, number>> = {
    [DatabaseType.MongoDB]: 1,
    [DatabaseType.Redis]: 2,
    [DatabaseType.SQLite]: 3,
  };
  const labels = ['MongoDB', 'Redis', 'SQLite'];

  for (let step = 0; step < stepsByType[type]; step += 1) {
    instance.stdin.write('j');
    await expectFrame(instance, `Database: ${labels[step]}`);
  }

  await expectFrame(instance, `Database: ${getDatabaseTypeLabel(type)}`);
}

export async function selectConnectionEnvironment(
  instance: AppRender,
  environment: ConnectionEnvironment,
): Promise<void> {
  instance.stdin.write('\t');
  await expectFrame(instance, '> Environment');

  const stepsByEnvironment: Readonly<Record<ConnectionEnvironment, number>> = {
    [ConnectionEnvironment.Local]: 1,
    [ConnectionEnvironment.Development]: 2,
    [ConnectionEnvironment.Production]: 3,
  };
  const environments = [
    ConnectionEnvironment.Local,
    ConnectionEnvironment.Development,
    ConnectionEnvironment.Production,
  ];

  for (let step = 0; step < stepsByEnvironment[environment]; step += 1) {
    instance.stdin.write('j');
    await expectFrame(instance, `Environment: ${environments[step]}`);
  }

  await expectFrame(instance, `Environment: ${environment}`);
}

export async function clearText(
  instance: AppRender,
  value: string,
): Promise<void> {
  const length = value.length;

  for (let index = 0; index < length; index += 1) {
    instance.stdin.write('\x7F');
    const expectedValue = value.slice(0, length - index - 1) || 'required';

    await vi.waitFor(() => {
      expect(instance.lastFrame()).toContain(`Name: ${expectedValue}`);
    });
  }
}

async function expectFrame(instance: AppRender, text: string): Promise<void> {
  await vi.waitFor(() => {
    expect(instance.lastFrame()).toContain(text);
  });
}

function getDatabaseTypeLabel(type: DatabaseType): string {
  if (type === DatabaseType.MongoDB) {
    return 'MongoDB';
  }

  if (type === DatabaseType.Redis) {
    return 'Redis';
  }

  return 'SQLite';
}
