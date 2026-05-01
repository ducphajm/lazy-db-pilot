import {
  ConnectionValidationError,
  ConnectionValidationErrorCode,
} from '../connections/errors.js';
import {MongoOperation, MongoServiceError} from '../mongodb/errors.js';

export function getConnectionErrorMessage(error: unknown): string {
  if (error instanceof ConnectionValidationError) {
    if (error.code === ConnectionValidationErrorCode.InvalidMongoUrl) {
      return 'Invalid MongoDB URL.';
    }

    return error.message;
  }

  return 'Unable to save connection.';
}

export function getDisplayError(
  error: unknown,
  operation: MongoOperation,
): string {
  if (error instanceof MongoServiceError) {
    return error.message;
  }

  switch (operation) {
    case MongoOperation.LoadCollectionDocuments:
      return 'Unable to load documents from the selected collection.';
    case MongoOperation.ListCollections:
      return 'Unable to load collections from the selected database.';
    case MongoOperation.ListDatabases:
      return 'Unable to connect to MongoDB or list databases.';
  }
}
