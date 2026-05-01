export enum MongoValidationErrorCode {
  EmptyUrl = 'empty-url',
  InvalidUrl = 'invalid-url',
}

export class MongoValidationError extends Error {
  public readonly code: MongoValidationErrorCode;

  public constructor(code: MongoValidationErrorCode, message: string) {
    super(message);
    this.name = 'MongoValidationError';
    this.code = code;
  }
}

export enum MongoOperation {
  LoadCollectionDocuments = 'load-collection-documents',
  ListCollections = 'list-collections',
  ListDatabases = 'list-databases',
}

export class MongoServiceError extends Error {
  public readonly operation: MongoOperation;
  public readonly cause: unknown;

  public constructor(operation: MongoOperation, cause: unknown) {
    super(getMongoServiceMessage(operation));
    this.name = 'MongoServiceError';
    this.operation = operation;
    this.cause = cause;
  }
}

export function getMongoServiceMessage(operation: MongoOperation): string {
  switch (operation) {
    case MongoOperation.LoadCollectionDocuments:
      return 'Unable to load documents from the selected collection.';
    case MongoOperation.ListCollections:
      return 'Unable to load collections from the selected database.';
    case MongoOperation.ListDatabases:
      return 'Unable to connect to MongoDB or list databases.';
  }
}
