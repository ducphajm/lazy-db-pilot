import {MongoValidationError} from '../mongodb/errors.js';
import {validateMongoUrl} from '../mongodb/validation.js';
import {
  ConnectionValidationError,
  ConnectionValidationErrorCode,
} from './errors.js';
import {
  ConnectionEnvironment,
  DatabaseType,
  type ConnectionInput,
  type DatabaseConnection,
  type MongoConnectionDetails,
} from './types.js';

export function validateConnection(
  input: ConnectionInput,
  existingConnections: readonly DatabaseConnection[] = [],
): DatabaseConnection {
  const name = input.name.trim();

  if (name.length === 0) {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.EmptyName,
      'Connection name is required.',
    );
  }

  if (existingConnections.some(connection => connection.name === name)) {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.DuplicateName,
      'Connection name must be unique.',
    );
  }

  if (!isDatabaseType(input.type)) {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.InvalidType,
      'Unsupported database type.',
    );
  }

  if (!isConnectionEnvironment(input.environment)) {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.InvalidEnvironment,
      'Unsupported connection environment.',
    );
  }

  switch (input.type) {
    case DatabaseType.MongoDB:
      return {
        name,
        type: DatabaseType.MongoDB,
        environment: input.environment,
        details: validateMongoDetails(input.details),
      };
    case DatabaseType.Redis:
      validateEmptyDetails(input.details);

      return {
        name,
        type: DatabaseType.Redis,
        environment: input.environment,
        details: {},
      };
    case DatabaseType.SQLite:
      validateEmptyDetails(input.details);

      return {
        name,
        type: DatabaseType.SQLite,
        environment: input.environment,
        details: {},
      };
  }
}

export function parseConnectionRecord(record: unknown): DatabaseConnection {
  if (!isRecord(record)) {
    throw invalidRecord();
  }

  const {name, type, environment, details} = record;

  if (
    typeof name !== 'string' ||
    !isDatabaseType(type) ||
    !isConnectionEnvironment(environment)
  ) {
    throw invalidRecord();
  }

  try {
    return validateConnection({
      name,
      type,
      environment,
      details,
    });
  } catch {
    throw invalidRecord();
  }
}

function validateMongoDetails(details: unknown): MongoConnectionDetails {
  if (!isRecord(details) || typeof details.url !== 'string') {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.InvalidDetails,
      'MongoDB URL is required.',
    );
  }

  try {
    return {url: validateMongoUrl(details.url)};
  } catch (error: unknown) {
    if (error instanceof MongoValidationError) {
      throw new ConnectionValidationError(
        ConnectionValidationErrorCode.InvalidMongoUrl,
        error.message,
      );
    }

    throw error;
  }
}

function validateEmptyDetails(details: unknown): void {
  if (!isRecord(details) || Object.keys(details).length > 0) {
    throw new ConnectionValidationError(
      ConnectionValidationErrorCode.InvalidDetails,
      'Connection details must be empty.',
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDatabaseType(value: unknown): value is DatabaseType {
  return Object.values(DatabaseType).includes(value as DatabaseType);
}

function isConnectionEnvironment(
  value: unknown,
): value is ConnectionEnvironment {
  return Object.values(ConnectionEnvironment).includes(
    value as ConnectionEnvironment,
  );
}

function invalidRecord(): ConnectionValidationError {
  return new ConnectionValidationError(
    ConnectionValidationErrorCode.InvalidRecord,
    'Invalid connection record.',
  );
}
