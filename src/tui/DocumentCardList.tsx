import {Box, Text} from 'ink';
import type {MongoCollectionDocument} from '../mongodb/service.js';

export function DocumentCardList({
  documents,
  selectedIndex,
}: {
  readonly documents: readonly MongoCollectionDocument[];
  readonly selectedIndex: number;
}): React.JSX.Element {
  return (
    <Box flexDirection="column">
      {documents.map((document, index) => (
        <DocumentCard
          document={document}
          documentIndex={index}
          isSelected={index === selectedIndex}
          key={getDocumentKey(document, index)}
        />
      ))}
    </Box>
  );
}

function DocumentCard({
  document,
  documentIndex,
  isSelected,
}: {
  readonly document: MongoCollectionDocument;
  readonly documentIndex: number;
  readonly isSelected: boolean;
}): React.JSX.Element {
  const fieldNames = getDocumentFieldNames(document);

  return (
    <Box
      borderColor={isSelected ? 'cyan' : 'gray'}
      borderStyle="single"
      flexDirection="column"
      marginBottom={1}
      paddingX={1}
    >
      <Text color={isSelected ? 'cyan' : undefined}>
        {isSelected ? '> ' : '  '}Document {documentIndex + 1}
      </Text>
      {fieldNames.map(fieldName => (
        <DocumentField
          fieldName={fieldName}
          key={fieldName}
          value={document[fieldName]}
        />
      ))}
    </Box>
  );
}

function DocumentField({
  fieldName,
  value,
}: {
  readonly fieldName: string;
  readonly value: unknown;
}): React.JSX.Element {
  const formattedValue = formatDocumentValue(value);
  const lines = formattedValue.split('\n');

  if (lines.length === 1) {
    return (
      <Text>
        <Text dimColor>{fieldName}: </Text>
        {lines[0]}
      </Text>
    );
  }

  return (
    <Box flexDirection="column">
      <Text dimColor>{fieldName}:</Text>
      <Box flexDirection="column" marginLeft={2}>
        {lines.map((line, index) => (
          <Text key={`${fieldName}:${index}`}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}

export function getDocumentFieldNames(
  document: MongoCollectionDocument,
): string[] {
  return Object.keys(document).sort((left, right) => {
    if (left === '_id') {
      return -1;
    }

    if (right === '_id') {
      return 1;
    }

    return 0;
  });
}

export function formatDocumentValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isObjectIdLike(value)) {
    return value.toHexString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (typeof value === 'object') {
    return stringifyNestedValue(value);
  }

  return String(value);
}

function getDocumentKey(
  document: MongoCollectionDocument,
  index: number,
): string {
  const idValue = document._id;

  if (idValue === undefined || idValue === null) {
    return String(index);
  }

  return `${formatDocumentValue(idValue)}:${index}`;
}

function stringifyNestedValue(value: object): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function isObjectIdLike(value: unknown): value is {toHexString: () => string} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toHexString' in value &&
    typeof value.toHexString === 'function'
  );
}
