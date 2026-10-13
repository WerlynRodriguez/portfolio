import { describe, expect, it } from 'vitest';
import { messages } from './messages';
import type { Namespace } from './utils';

describe('i18n Namespace & Key Parity', () => {
  const namespaces = Object.keys(messages.en) as Namespace[];

  it('contains the exact same namespaces in English and Spanish', () => {
    const enNamespaces = Object.keys(messages.en).sort();
    const esNamespaces = Object.keys(messages.es).sort();
    expect(enNamespaces).toEqual(esNamespaces);
  });

  for (const ns of namespaces) {
    describe(`namespace: "${ns}"`, () => {
      it('has identical keys between English and Spanish', () => {
        const enKeys = Object.keys(messages.en[ns]).sort();
        const esKeys = Object.keys(messages.es[ns]).sort();
        expect(enKeys).toEqual(esKeys);
      });

      it('contains non-empty string values in both languages', () => {
        for (const [key, val] of Object.entries(messages.en[ns])) {
          expect(
            typeof val === 'string' && val.trim().length > 0,
            `Empty English value in namespace "${ns}" at key "${key}"`,
          ).toBe(true);
        }

        for (const [key, val] of Object.entries(messages.es[ns])) {
          expect(
            typeof val === 'string' && val.trim().length > 0,
            `Empty Spanish value in namespace "${ns}" at key "${key}"`,
          ).toBe(true);
        }
      });
    });
  }
});
