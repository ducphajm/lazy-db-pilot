import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import {afterEach, describe, expect, it} from 'vitest';
import {DocumentTable, formatDocumentValue} from './DocumentTable.js';

afterEach(() => {
  cleanup();
});

describe('DocumentTable', () => {
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

  it('keeps multi-line table cells aligned', () => {
    const instance = render(
      <DocumentTable
        documents={[
          {
            _id: '1',
            profile: {role: 'admin', active: true},
            tags: ['ops', 'db'],
          },
        ]}
      />,
    );

    const frame = instance.lastFrame() ?? '';

    expect(frame).toContain('profile');
    expect(frame).toContain('{');
    expect(frame).toContain('  "role": "admin",');
    expect(frame).toContain('  "active": true');
    expect(frame).toContain('[');
    expect(frame).toContain('  "ops",');
    expect(frame).not.toContain('{"role":"admin"');
  });
});
