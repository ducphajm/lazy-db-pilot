export enum ConnectionValidationErrorCode {
  DuplicateName = 'duplicate-name',
  EmptyName = 'empty-name',
  InvalidDetails = 'invalid-details',
  InvalidEnvironment = 'invalid-environment',
  InvalidMongoUrl = 'invalid-mongo-url',
  InvalidRecord = 'invalid-record',
  InvalidType = 'invalid-type',
}

export class ConnectionValidationError extends Error {
  public readonly code: ConnectionValidationErrorCode;

  public constructor(code: ConnectionValidationErrorCode, message: string) {
    super(message);
    this.name = 'ConnectionValidationError';
    this.code = code;
  }
}
