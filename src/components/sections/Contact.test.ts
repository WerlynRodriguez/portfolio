import { contactData as enContact } from '@content/data/en';
import { contactData as esContact } from '@content/data/es';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Contact from './Contact.astro';

describe('Contact section component', () => {
  it('binds contact email to copy button and mailto link dynamically', async () => {
    const container = await AstroContainer.create();

    const resultEn = await container.renderToString(Contact, {
      props: { lang: 'en' },
    });
    expect(resultEn).toContain(`data-value="${enContact.email}"`);
    expect(resultEn).toContain(`href="mailto:${enContact.email}"`);

    const resultEs = await container.renderToString(Contact, {
      props: { lang: 'es' },
    });
    expect(resultEs).toContain(`data-value="${esContact.email}"`);
    expect(resultEs).toContain(`href="mailto:${esContact.email}"`);
  });

  it('renders all social channels dynamically from contactData with secure external link attributes', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Contact, {
      props: { lang: 'en' },
    });

    for (const social of enContact.socials) {
      expect(result).toContain(`href="${social.url}"`);
    }
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });
});
