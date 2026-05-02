import { describe, it, expect } from 'vitest';
import { extensionToFileType } from './extensionToFileType';

describe('extensionToFileType', () => {
  it('should return correct type for common extensions', () => {
    expect(extensionToFileType('js')).toBe('javascript');
    expect(extensionToFileType('jsx')).toBe('javascript');
    expect(extensionToFileType('ts')).toBe('typescript');
    expect(extensionToFileType('html')).toBe('html');
    expect(extensionToFileType('css')).toBe('css');
    expect(extensionToFileType('json')).toBe('json');
  });

  it('should return undefined for unknown extensions', () => {
    expect(extensionToFileType('unknown')).toBeUndefined();
  });

  it('should return undefined for empty extension', () => {
    expect(extensionToFileType('')).toBeUndefined();
    expect(extensionToFileType(null)).toBeUndefined();
  });
});
