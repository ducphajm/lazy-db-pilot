import {describe, expect, it, vi} from 'vitest';
import {MongoOperation, MongoServiceError} from './errors.js';
import type {MongoClientFactory, MongoClientLike} from './service.js';
import {listMongoCollections, listMongoDatabases} from './service.js';
import {validateMongoUrl} from './validation.js';

function createMockClient(
  overrides: Partial<MongoClientLike> = {},
): MongoClientLike {
  return {
    connect: vi.fn(async () => undefined),
    db: vi.fn(() => ({
      admin: () => ({
        listDatabases: async () => ({
          databases: [{name: 'admin'}, {name: 'app'}],
        }),
      }),
      collections: async () => [
        {collectionName: 'users'},
        {collectionName: 'orders'},
      ],
    })),
    close: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('validateMongoUrl', () => {
  it('rejects empty input', () => {
    expect(() => validateMongoUrl('   ')).toThrow('MongoDB URL is required.');
  });

  it('trims non-empty input', () => {
    expect(validateMongoUrl(' mongodb://localhost:27017 ')).toBe(
      'mongodb://localhost:27017',
    );
  });
});

describe('MongoDB service', () => {
  it('maps listed database names', async () => {
    const client = createMockClient();
    const createClient: MongoClientFactory = () => client;

    await expect(listMongoDatabases('mongodb://example', createClient)).resolves
      .toEqual(['admin', 'app']);
  });

  it('maps listed collection names', async () => {
    const client = createMockClient();
    const createClient: MongoClientFactory = () => client;

    await expect(
      listMongoCollections('mongodb://example', 'app', createClient),
    ).resolves.toEqual(['users', 'orders']);
  });

  it('closes the client when database listing fails', async () => {
    const close = vi.fn(async () => undefined);
    const client = createMockClient({
      db: () => ({
        admin: () => ({
          listDatabases: async () => {
            throw new Error('mongodb://user:secret@example failed');
          },
        }),
        collections: async () => [],
      }),
      close,
    });
    const createClient: MongoClientFactory = () => client;

    await expect(listMongoDatabases('mongodb://example', createClient)).rejects
      .toMatchObject({
        operation: MongoOperation.ListDatabases,
        message: 'Unable to connect to MongoDB or list databases.',
      } satisfies Partial<MongoServiceError>);
    expect(close).toHaveBeenCalledOnce();
  });
});
