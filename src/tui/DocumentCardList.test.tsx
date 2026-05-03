import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it} from 'vitest';
import {
  DocumentCardList,
  formatDocumentValue,
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

    expect(frame).toContain('Document 1');
    expect(frame).toContain('> Document 2');
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

  it('truncates oversized document fields', () => {
    const document = Object.fromEntries([
      ['_id', '1'],
      ['startup_log', Array.from({length: 20}, (_, index) => `line-${index}`).join('\n')],
      ...Array.from({length: 31}, (_, index) => [`field_${index}`, index]),
    ]);
    const instance = render(
      <DocumentCardList documents={[document]} selectedIndex={0} />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('startup_log:');
    expect(frame).toContain('... 8 more lines hidden');
    expect(frame).toContain('... 3 more fields hidden');
  });
});
