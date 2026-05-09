import {describe, expect, it, vi} from 'vitest';
import {MongoOperation, MongoServiceError} from './errors.js';
import type {MongoClientFactory, MongoClientLike} from './service.js';
import {
  DEFAULT_COLLECTION_DOCUMENT_LIMIT,
  insertMongoCollectionDocument,
  listMongoCollections,
  listMongoDatabases,
  loadMongoCollectionDocuments,
} from './service.js';
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
      collection: () => ({
        find: () => ({
          toArray: async () => [{_id: '1', name: 'Ada'}],
        }),
        insertOne: async () => ({insertedId: '2'}),
      }),
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

  it('loads collection documents', async () => {
    const client = createMockClient();
    const createClient: MongoClientFactory = () => client;

    await expect(
      loadMongoCollectionDocuments(
        'mongodb://example',
        'app',
        'users',
        10,
        createClient,
      ),
    ).resolves.toEqual([{_id: '1', name: 'Ada'}]);
  });

  it('inserts a collection document', async () => {
    const insertOne = vi.fn(async () => ({insertedId: '2'}));
    const client = createMockClient({
      db: () => ({
        admin: () => ({
          listDatabases: async () => ({databases: []}),
        }),
        collections: async () => [],
        collection: () => ({
          find: () => ({
            toArray: async () => [],
          }),
          insertOne,
        }),
      }),
    });
    const createClient: MongoClientFactory = () => client;

    await expect(
      insertMongoCollectionDocument(
        'mongodb://example',
        'app',
        'users',
        {name: 'Ada'},
        createClient,
      ),
    ).resolves.toBeUndefined();

    expect(insertOne).toHaveBeenCalledWith({name: 'Ada'});
  });

  it('applies the default collection document limit', async () => {
    const find = vi.fn(() => ({
      toArray: async () => [{_id: '1'}],
    }));
    const client = createMockClient({
      db: () => ({
        admin: () => ({
          listDatabases: async () => ({databases: []}),
        }),
        collections: async () => [],
        collection: () => ({
          find,
          insertOne: async () => ({insertedId: '2'}),
        }),
      }),
    });
    const createClient: MongoClientFactory = () => client;

    await loadMongoCollectionDocuments(
      'mongodb://example',
      'app',
      'users',
      undefined,
      createClient,
    );

    expect(find).toHaveBeenCalledWith(
      {},
      {limit: DEFAULT_COLLECTION_DOCUMENT_LIMIT},
    );
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
        collection: () => ({
          find: () => ({
            toArray: async () => [],
          }),
          insertOne: async () => ({insertedId: '2'}),
        }),
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

  it('closes the client when document loading fails', async () => {
    const close = vi.fn(async () => undefined);
    const client = createMockClient({
      db: () => ({
        admin: () => ({
          listDatabases: async () => ({databases: []}),
        }),
        collections: async () => [],
        collection: () => ({
          find: () => ({
            toArray: async () => {
              throw new Error('mongodb://user:secret@example failed');
            },
          }),
          insertOne: async () => ({insertedId: '2'}),
        }),
      }),
      close,
    });
    const createClient: MongoClientFactory = () => client;

    await expect(
      loadMongoCollectionDocuments(
        'mongodb://example',
        'app',
        'users',
        undefined,
        createClient,
      ),
    ).rejects.toMatchObject({
      operation: MongoOperation.LoadCollectionDocuments,
      message: 'Unable to load documents from the selected collection.',
    } satisfies Partial<MongoServiceError>);
    expect(close).toHaveBeenCalledOnce();
  });

  it('maps insert failures and closes the client', async () => {
    const close = vi.fn(async () => undefined);
    const client = createMockClient({
      db: () => ({
        admin: () => ({
          listDatabases: async () => ({databases: []}),
        }),
        collections: async () => [],
        collection: () => ({
          find: () => ({
            toArray: async () => [],
          }),
          insertOne: async () => {
            throw new Error('mongodb://user:secret@example failed');
          },
        }),
      }),
      close,
    });
    const createClient: MongoClientFactory = () => client;

    await expect(
      insertMongoCollectionDocument(
        'mongodb://example',
        'app',
        'users',
        {name: 'Ada'},
        createClient,
      ),
    ).rejects.toMatchObject({
      operation: MongoOperation.InsertDocument,
      message: 'Unable to insert document into the selected collection.',
    } satisfies Partial<MongoServiceError>);
    expect(close).toHaveBeenCalledOnce();
  });
});
