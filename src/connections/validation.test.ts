import {describe, expect, it} from 'vitest';
import {
  ConnectionValidationErrorCode,
  ConnectionValidationError,
} from './errors.js';
import {validateConnection} from './validation.js';
import {ConnectionEnvironment, DatabaseType} from './types.js';

describe('validateConnection', () => {
  it('creates a MongoDB connection with trimmed values', () => {
    expect(
      validateConnection({
        name: ' Local Mongo ',
        type: DatabaseType.MongoDB,
        environment: ConnectionEnvironment.Local,
        details: {url: ' mongodb://localhost:27017 '},
      }),
    ).toEqual({
      name: 'Local Mongo',
      type: DatabaseType.MongoDB,
      environment: ConnectionEnvironment.Local,
      details: {url: 'mongodb://localhost:27017'},
    });
  });

  it('creates Redis and SQLite connections with empty details', () => {
    expect(
      validateConnection({
        name: 'Redis',
        type: DatabaseType.Redis,
        environment: ConnectionEnvironment.Development,
        details: {},
      }).details,
    ).toEqual({});

    expect(
      validateConnection({
        name: 'SQLite',
        type: DatabaseType.SQLite,
        environment: ConnectionEnvironment.Production,
        details: {},
      }).details,
    ).toEqual({});
  });

  it('rejects empty and duplicate names', () => {
    expectValidation(() =>
      validateConnection({
        name: ' ',
        type: DatabaseType.Redis,
        environment: ConnectionEnvironment.Local,
        details: {},
      }),
    ).toThrowCode(ConnectionValidationErrorCode.EmptyName);

    const existing = [
      validateConnection({
        name: 'Primary',
        type: DatabaseType.Redis,
        environment: ConnectionEnvironment.Local,
        details: {},
      }),
    ];

    expectValidation(() =>
      validateConnection(
        {
          name: 'Primary',
          type: DatabaseType.SQLite,
          environment: ConnectionEnvironment.Local,
          details: {},
        },
        existing,
      ),
    ).toThrowCode(ConnectionValidationErrorCode.DuplicateName);
  });

  it('rejects unsupported type and environment values', () => {
    expectValidation(() =>
      validateConnection({
        name: 'Bad Type',
        type: 'mysql' as DatabaseType,
        environment: ConnectionEnvironment.Local,
        details: {},
      }),
    ).toThrowCode(ConnectionValidationErrorCode.InvalidType);

    expectValidation(() =>
      validateConnection({
        name: 'Bad Environment',
        type: DatabaseType.Redis,
        environment: 'staging' as ConnectionEnvironment,
        details: {},
      }),
    ).toThrowCode(ConnectionValidationErrorCode.InvalidEnvironment);
  });

  it('rejects invalid MongoDB URLs and non-empty Redis or SQLite details', () => {
    expectValidation(() =>
      validateConnection({
        name: 'Mongo',
        type: DatabaseType.MongoDB,
        environment: ConnectionEnvironment.Local,
        details: {url: 'https://example.com'},
      }),
    ).toThrowCode(ConnectionValidationErrorCode.InvalidMongoUrl);

    expectValidation(() =>
      validateConnection({
        name: 'Redis',
        type: DatabaseType.Redis,
        environment: ConnectionEnvironment.Local,
        details: {url: 'redis://localhost'},
      }),
    ).toThrowCode(ConnectionValidationErrorCode.InvalidDetails);
  });
});

function expectValidation(fn: () => unknown): {
  readonly toThrowCode: (code: ConnectionValidationErrorCode) => void;
} {
  return {
    toThrowCode(code) {
      try {
        fn();
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ConnectionValidationError);
        expect((error as ConnectionValidationError).code).toBe(code);
        return;
      }

      throw new Error(`Expected connection validation error code ${code}.`);
    },
  };
}
