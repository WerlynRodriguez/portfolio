import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ThemeSwitcher from './ThemeSwitcher.astro';

describe('ThemeSwitcher component (R4 / AC5)', () => {
  it('renders trigger button with popovertarget and menu in English', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeSwitcher, {
      props: { lang: 'en' },
    });

    // Trigger button
    expect(result).toContain('popovertarget="theme-menu"');
    expect(result).toContain('aria-haspopup="menu"');

    // Popover menu
    expect(result).toContain('id="theme-menu"');
    expect(result).toContain('popover');
    expect(result).toContain('role="menu"');

    // 4 menuitemradio buttons
    expect(result).toContain('role="menuitemradio"');
    expect(result).toContain('data-theme-option="system"');
    expect(result).toContain('data-theme-option="light"');
    expect(result).toContain('data-theme-option="dark"');
    expect(result).toContain('data-theme-option="bee"');

    // English labels
    expect(result).toContain('System');
    expect(result).toContain('Light');
    expect(result).toContain('Dark');
    expect(result).toContain('Bee');
  });

  it('renders localized Spanish labels when lang="es"', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeSwitcher, {
      props: { lang: 'es' },
    });

    expect(result).toContain('Sistema');
    expect(result).toContain('Claro');
    expect(result).toContain('Oscuro');
    expect(result).toContain('Colmena');
  });
});
