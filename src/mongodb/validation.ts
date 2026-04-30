import {
  MongoValidationError,
  MongoValidationErrorCode,
} from './errors.js';

export function validateMongoUrl(input: string): string {
  const url = input.trim();

  if (url.length === 0) {
    throw new MongoValidationError(
      MongoValidationErrorCode.EmptyUrl,
      'MongoDB URL is required.',
    );
  }

  return url;
}
