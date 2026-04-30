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

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new MongoValidationError(
      MongoValidationErrorCode.InvalidUrl,
      'MongoDB URL must start with mongodb:// or mongodb+srv://.',
    );
  }

  if (parsed.protocol !== 'mongodb:' && parsed.protocol !== 'mongodb+srv:') {
    throw new MongoValidationError(
      MongoValidationErrorCode.InvalidUrl,
      'MongoDB URL must start with mongodb:// or mongodb+srv://.',
    );
  }

  return url;
}
