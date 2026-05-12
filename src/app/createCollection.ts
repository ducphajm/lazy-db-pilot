export type CreateCollectionDraft = {
  readonly databaseName: string;
  readonly error: string | null;
  readonly isSubmitting: boolean;
  readonly name: string;
  readonly url: string;
};

export function createCollectionDraft(input: {
  readonly databaseName: string;
  readonly url: string;
}): CreateCollectionDraft {
  return {
    databaseName: input.databaseName,
    error: null,
    isSubmitting: false,
    name: '',
    url: input.url,
  };
}

export function validateCreateCollectionName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new Error('Collection name is required.');
  }

  return trimmedName;
}
