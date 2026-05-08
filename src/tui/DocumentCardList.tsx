import {Box, Text} from 'ink';
import type {MongoCollectionDocument} from '../mongodb/service.js';

export function DocumentCardList({
  cursorLineIndex = 0,
  documents,
  isFocused = true,
  scrollOffset = 0,
  selectedIndex,
  visibleRowCount,
}: {
  readonly cursorLineIndex?: number;
  readonly documents: readonly MongoCollectionDocument[];
  readonly isFocused?: boolean;
  readonly scrollOffset?: number;
  readonly selectedIndex: number;
  readonly visibleRowCount?: number;
}): React.JSX.Element {
  const rows = getDocumentCardRows(documents);
  const visibleRows =
    visibleRowCount === undefined
      ? rows
      : rows.slice(scrollOffset, scrollOffset + visibleRowCount);

  return (
    <Box
      flexDirection="column"
      flexShrink={0}
      height={visibleRowCount}
      overflowY="hidden"
    >
      {visibleRows.map(row => (
        <Text
          color={
            isFocused && row.documentIndex === selectedIndex ? 'cyan' : undefined
          }
          dimColor={row.kind === DocumentCardRowKind.Gap}
          key={row.key}
        >
          {row.cursorLineIndex === cursorLineIndex && isFocused ? '>' : ' '}
          {row.text}
        </Text>
      ))}
    </Box>
  );
}

export enum DocumentCardRowKind {
  Border = 'border',
  Content = 'content',
  Gap = 'gap',
}

export type DocumentCardRow = {
  readonly cursorLineIndex: number | null;
  readonly documentIndex: number;
  readonly key: string;
  readonly kind: DocumentCardRowKind;
  readonly text: string;
};

export type DocumentCardMetrics = {
  readonly cursorLineCount: number;
  readonly rows: readonly DocumentCardRow[];
};

export function getDocumentCardMetrics(
  documents: readonly MongoCollectionDocument[],
): DocumentCardMetrics {
  const rows = getDocumentCardRows(documents);

  return {
    cursorLineCount: rows.filter(row => row.cursorLineIndex !== null).length,
    rows,
  };
}

export function getDocumentCardRows(
  documents: readonly MongoCollectionDocument[],
): readonly DocumentCardRow[] {
  let cursorLineIndex = 0;

  return documents.flatMap((document, documentIndex) => {
    const rows: DocumentCardRow[] = [
      createDocumentCardRow({
        cursorLineIndex: null,
        documentIndex,
        kind: DocumentCardRowKind.Border,
        keyPart: 'top',
        text: '+-',
      }),
    ];

    for (const fieldName of getDocumentFieldNames(document)) {
      const fieldRows = getDocumentFieldRows({
        cursorLineIndex,
        documentIndex,
        fieldName,
        value: document[fieldName],
      });

      rows.push(...fieldRows);
      cursorLineIndex += fieldRows.length;
    }

    rows.push(
      createDocumentCardRow({
        cursorLineIndex: null,
        documentIndex,
        kind: DocumentCardRowKind.Border,
        keyPart: 'bottom',
        text: '+-',
      }),
    );

    if (documentIndex < documents.length - 1) {
      rows.push(
        createDocumentCardRow({
          cursorLineIndex: null,
          documentIndex,
          kind: DocumentCardRowKind.Gap,
          keyPart: 'gap',
          text: '',
        }),
      );
    }

    return rows;
  });
}

function getDocumentFieldRows({
  cursorLineIndex,
  documentIndex,
  fieldName,
  value,
}: {
  readonly cursorLineIndex: number;
  readonly documentIndex: number;
  readonly fieldName: string;
  readonly value: unknown;
}): readonly DocumentCardRow[] {
  const preview = getDocumentValuePreview(formatDocumentValue(value));
  const lines = preview.value.split('\n');

  if (lines.length === 1) {
    const hiddenText =
      preview.hiddenLineCount > 0
        ? ` ... ${preview.hiddenLineCount} more lines hidden`
        : '';

    return [
      createDocumentCardRow({
        cursorLineIndex,
        documentIndex,
        kind: DocumentCardRowKind.Content,
        keyPart: `${fieldName}:0`,
        text: `| ${fieldName}: ${lines[0]}${hiddenText}`,
      }),
    ];
  }

  const rows = [
    createDocumentCardRow({
      cursorLineIndex,
      documentIndex,
      kind: DocumentCardRowKind.Content,
      keyPart: `${fieldName}:label`,
      text: `| ${fieldName}:`,
    }),
    ...lines.map((line, index) =>
      createDocumentCardRow({
        cursorLineIndex: cursorLineIndex + index + 1,
        documentIndex,
        kind: DocumentCardRowKind.Content,
        keyPart: `${fieldName}:${index}`,
        text: `|   ${line}`,
      }),
    ),
  ];

  if (preview.hiddenLineCount > 0) {
    rows.push(
      createDocumentCardRow({
        cursorLineIndex: cursorLineIndex + rows.length,
        documentIndex,
        kind: DocumentCardRowKind.Content,
        keyPart: `${fieldName}:hidden`,
        text: `| ... ${preview.hiddenLineCount} more lines hidden`,
      }),
    );
  }

  return rows;
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

function createDocumentCardRow({
  cursorLineIndex,
  documentIndex,
  keyPart,
  kind,
  text,
}: {
  readonly cursorLineIndex: number | null;
  readonly documentIndex: number;
  readonly keyPart: string;
  readonly kind: DocumentCardRowKind;
  readonly text: string;
}): DocumentCardRow {
  return {
    cursorLineIndex,
    documentIndex,
    key: `${documentIndex}:${keyPart}`,
    kind,
    text,
  };
}

function stringifyNestedValue(value: object): string {
  try {
    const compactValue = getCompactExtendedJsonValue(value);

    if (compactValue !== undefined) {
      return JSON.stringify(compactValue) ?? String(value);
    }

    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

function getCompactExtendedJsonValue(value: object): object | undefined {
  if (isCompactExtendedJsonValue(value)) {
    return value;
  }

  if (!isJsonSerializableObject(value)) {
    return undefined;
  }

  const jsonValue = value.toJSON();

  if (
    typeof jsonValue === 'object' &&
    jsonValue !== null &&
    isCompactExtendedJsonValue(jsonValue)
  ) {
    return jsonValue;
  }

  return undefined;
}

function isCompactExtendedJsonValue(value: object): boolean {
  if (Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);

  return (
    entries.length === 1 &&
    compactExtendedJsonKeys.has(entries[0]?.[0] ?? '') &&
    isJsonScalar(entries[0]?.[1])
  );
}

function isJsonSerializableObject(
  value: object,
): value is {toJSON: () => unknown} {
  return 'toJSON' in value && typeof value.toJSON === 'function';
}

function isJsonScalar(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isObjectIdLike(value: unknown): value is {toHexString: () => string} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toHexString' in value &&
    typeof value.toHexString === 'function'
  );
}

function getDocumentValuePreview(value: string): {
  readonly hiddenLineCount: number;
  readonly value: string;
} {
  const lines = value.split('\n');
  const visibleLines = lines.slice(0, maxVisibleFieldLines);
  const hiddenLineCount = Math.max(0, lines.length - visibleLines.length);

  return {
    hiddenLineCount,
    value: visibleLines.map(truncateLine).join('\n'),
  };
}

function truncateLine(line: string): string {
  if (line.length <= maxVisibleLineLength) {
    return line;
  }

  return `${line.slice(0, maxVisibleLineLength)}... ${line.length - maxVisibleLineLength} more chars hidden`;
}

const maxVisibleFieldLines = 12;
const maxVisibleLineLength = 180;

const compactExtendedJsonKeys = new Set([
  '$binary',
  '$code',
  '$date',
  '$dbPointer',
  '$maxKey',
  '$minKey',
  '$numberDecimal',
  '$numberDouble',
  '$numberInt',
  '$numberLong',
  '$oid',
  '$regularExpression',
  '$symbol',
  '$timestamp',
  '$undefined',
]);
