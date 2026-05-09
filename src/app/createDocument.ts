import type {MongoCollectionDocument} from '../mongodb/service.js';

export type CreateDocumentDraft = {
  readonly collectionName: string;
  readonly databaseName: string;
  readonly error: string | null;
  readonly isSubmitting: boolean;
  readonly tabId: string;
  readonly text: string;
  readonly url: string;
};

export function createDocumentDraft(input: {
  readonly collectionName: string;
  readonly databaseName: string;
  readonly tabId: string;
  readonly url: string;
}): CreateDocumentDraft {
  return {
    collectionName: input.collectionName,
    databaseName: input.databaseName,
    error: null,
    isSubmitting: false,
    tabId: input.tabId,
    text: '{}',
    url: input.url,
  };
}

export function parseCreateDocumentText(
  text: string,
): MongoCollectionDocument {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Document must be valid JSON.');
  }

  if (!isPlainJsonObject(parsed)) {
    throw new Error('Document JSON must be an object.');
  }

  return parsed;
}

function isPlainJsonObject(value: unknown): value is MongoCollectionDocument {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
