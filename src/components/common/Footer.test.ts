import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Footer from './Footer.astro';

describe('Footer component', () => {
  it('renders shortened back-to-top button label "Home ↑" in English (Spec 018 AC3)', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { lang: 'en' },
    });

    expect(result).toContain('Home ↑');
    expect(result).not.toContain('Back to top ↑');
  });

  it('renders shortened back-to-top button label "Inicio ↑" in Spanish (Spec 018 AC3)', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { lang: 'es' },
    });

    expect(result).toContain('Inicio ↑');
    expect(result).not.toContain('Volver arriba ↑');
  });

  it('renders footer-row structure with copyright, attribution, and action (Spec 018 AC2)', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { lang: 'en' },
    });

    expect(result).toContain('footer-row');
    expect(result).toContain('footer-copyright');
    expect(result).toContain('footer-attribution');
    expect(result).toContain('footer-action');
    expect(result).toContain('btn-to-top');
  });
});
