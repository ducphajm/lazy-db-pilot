import {describe, expect, it} from 'vitest';
import {parseCreateDocumentText} from './createDocument.js';

describe('parseCreateDocumentText', () => {
  it('parses JSON object document content', () => {
    expect(parseCreateDocumentText('{"name":"Ada"}')).toEqual({name: 'Ada'});
  });

  it('rejects JSON arrays', () => {
    expect(() => parseCreateDocumentText('[]')).toThrow(
      'Document JSON must be an object.',
    );
  });
});
