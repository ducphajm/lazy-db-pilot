import React from 'react';
import {Box} from 'ink';
import {cleanup, render} from 'ink-testing-library';
import {Decimal128} from 'mongodb';
import {afterEach, describe, expect, it} from 'vitest';
import {
  DocumentCardList,
  formatDocumentValue,
  getDocumentCardMetrics,
  getDocumentFieldNames,
} from './DocumentCardList.js';

afterEach(() => {
  cleanup();
});

describe('DocumentCardList', () => {
  it('formats document values by type', () => {
    const objectId = {toHexString: () => '507f1f77bcf86cd799439011'};

    expect(formatDocumentValue({role: 'admin'})).toBe('{\n  "role": "admin"\n}');
    expect(formatDocumentValue(['read', 'write'])).toBe('[\n  "read",\n  "write"\n]');
    expect(formatDocumentValue('Ada')).toBe('Ada');
    expect(formatDocumentValue(42)).toBe('42');
    expect(formatDocumentValue(true)).toBe('true');
    expect(formatDocumentValue(null)).toBe('null');
    expect(formatDocumentValue(undefined)).toBe('');
    expect(formatDocumentValue(new Date('2026-05-03T00:00:00.000Z'))).toBe(
      '2026-05-03T00:00:00.000Z',
    );
    expect(formatDocumentValue(objectId)).toBe('507f1f77bcf86cd799439011');
  });

  it('formats scalar extended JSON wrappers on one line', () => {
    expect(formatDocumentValue({$numberDecimal: '1743.3120612409582'})).toBe(
      '{"$numberDecimal":"1743.3120612409582"}',
    );
    expect(
      formatDocumentValue(Decimal128.fromString('1743.3120612409582')),
    ).toBe('{"$numberDecimal":"1743.3120612409582"}');
  });

  it('orders _id before other vertical fields', () => {
    expect(getDocumentFieldNames({name: 'Ada', _id: '1', active: true})).toEqual([
      '_id',
      'name',
      'active',
    ]);
  });

  it('renders documents as selected cards with vertical scalar fields', () => {
    const instance = render(
      <DocumentCardList
        documents={[
          {_id: '1', name: 'Ada', active: true},
          {_id: '2', name: 'Grace', active: false},
        ]}
        selectedIndex={1}
      />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).not.toContain('Document 1');
    expect(frame).not.toContain('Document 2');
    expect(frame).toContain('_id: 1');
    expect(frame).toContain('name: Ada');
    expect(frame).toContain('active: false');
  });

  it('renders nested JSON values as indented multi-line field values', () => {
    const instance = render(
      <DocumentCardList
        documents={[
          {
            _id: '1',
            profile: {role: 'admin', active: true},
            tags: ['ops', 'db'],
          },
        ]}
        selectedIndex={0}
      />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('profile:');
    expect(frame).toContain('{');
    expect(frame).toContain('  "role": "admin",');
    expect(frame).toContain('  "active": true');
    expect(frame).toContain('tags:');
    expect(frame).toContain('[');
    expect(frame).toContain('  "ops",');
    expect(frame).not.toContain('{"role":"admin"');
  });

  it('truncates oversized document values', () => {
    const document = Object.fromEntries([
      ['_id', '1'],
      ['startup_log', Array.from({length: 20}, (_, index) => `line-${index}`).join('\n')],
    ]);
    const instance = render(
      <DocumentCardList documents={[document]} selectedIndex={0} />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('startup_log:');
    expect(frame).toContain('... 8 more lines hidden');
  });

  it('renders all top-level document fields without hidden-field summaries', () => {
    const document = Object.fromEntries([
      ['_id', '1'],
      ...Array.from({length: 36}, (_, index) => [`field_${index}`, index]),
    ]);
    const instance = render(
      <DocumentCardList documents={[document]} selectedIndex={0} />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('_id: 1');
    expect(frame).toContain('field_0: 0');
    expect(frame).toContain('field_35: 35');
    expect(frame).not.toContain('more fields hidden');
  });

  it('renders a bounded visible row window without shrinking cards', () => {
    const documents = Array.from({length: 10}, (_, index) => ({
      _id: String(index),
      name: `name-${index}`,
      updatedAt: '2026-05-04T00:00:00.000Z',
    }));
    const instance = render(
      <Box>
        <DocumentCardList
          documents={documents}
          selectedIndex={0}
          visibleRowCount={6}
        />
      </Box>,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('_id: 0');
    expect(frame).toContain('name: name-0');
    expect(frame).not.toContain('_id: 3');
  });

  it('measures rendered rows for document scroll calculations', () => {
    const metrics = getDocumentCardMetrics([
      {_id: '1', profile: {role: 'admin'}, name: 'Ada'},
      {_id: '2', name: 'Grace'},
    ]);

    expect(metrics.cursorLineCount).toBe(8);
    expect(metrics.rows.some(row => row.text.includes('profile:'))).toBe(true);
    expect(metrics.rows.at(-1)?.text).toBe('+-');
  });
});
