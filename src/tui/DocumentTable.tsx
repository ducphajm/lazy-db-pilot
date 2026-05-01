import {Box, Text} from 'ink';
import type {MongoCollectionDocument} from '../mongodb/service.js';

const MAX_CELL_WIDTH = 24;

export function DocumentTable({
  documents,
}: {
  readonly documents: readonly MongoCollectionDocument[];
}): React.JSX.Element {
  const columns = getDocumentColumns(documents);
  const rows = documents.map(document =>
    columns.map(column => formatDocumentValue(document[column])),
  );
  const widths = columns.map((column, index) =>
    Math.min(
      MAX_CELL_WIDTH,
      Math.max(
        column.length,
        ...rows.map(row => row[index]?.length ?? 0),
      ),
    ),
  );

  return (
    <Box flexDirection="column">
      <Text>{formatRow(columns, widths)}</Text>
      <Text dimColor>{formatRow(widths.map(width => '-'.repeat(width)), widths)}</Text>
      {rows.map((row, index) => (
        <Text key={index}>{formatRow(row, widths)}</Text>
      ))}
    </Box>
  );
}

export function getDocumentColumns(
  documents: readonly MongoCollectionDocument[],
): string[] {
  const columns: string[] = [];

  for (const document of documents) {
    for (const key of Object.keys(document)) {
      if (!columns.includes(key)) {
        columns.push(key);
      }
    }
  }

  return columns.sort((left, right) => {
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

function formatRow(values: readonly string[], widths: readonly number[]): string {
  return values
    .map((value, index) => padCell(truncateCell(value), widths[index] ?? 0))
    .join(' | ');
}

function truncateCell(value: string): string {
  if (value.length <= MAX_CELL_WIDTH) {
    return value;
  }

  return `${value.slice(0, MAX_CELL_WIDTH - 3)}...`;
}

function padCell(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(width - value.length, 0))}`;
}

function stringifyNestedValue(value: object): string {
  try {
    return JSON.stringify(value) ?? String(value);
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
