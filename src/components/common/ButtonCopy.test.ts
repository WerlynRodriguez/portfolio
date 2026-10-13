import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ButtonCopy from './ButtonCopy.astro';

describe('ButtonCopy component', () => {
  it('renders payload and data attributes correctly', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ButtonCopy, {
      props: {
        data: 'rdwerlynjose.16@gmail.com',
        id: 'copy-email-btn',
      },
    });

    expect(result).toContain('rdwerlynjose.16@gmail.com');
    expect(result).not.toContain('data-email=');
    expect(result).toContain('data-value="rdwerlynjose.16@gmail.com"');
    expect(result).toContain('data-state="idle"');
    expect(result).toContain('role="status"');
    expect(result).toContain('aria-live="polite"');
    expect(result).toContain('id="copy-email-btn"');
  });

  it('renders custom text when provided', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ButtonCopy, {
      props: {
        data: 'secret-token-123',
        text: 'Copy API Key',
      },
    });

    expect(result).toContain('Copy API Key');
    expect(result).toContain('data-value="secret-token-123"');
  });

  it('renders prefix icon when prefixIcon prop is provided', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ButtonCopy, {
      props: {
        data: 'test@example.com',
        prefixIcon: 'mail',
      },
    });

    expect(result).toMatch(/data-icon="mail"|<svg[^>]*data-icon="mail"/);
  });

  it('renders postfix icons for default, success, and error feedback states', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ButtonCopy, {
      props: {
        data: 'test@example.com',
      },
    });

    expect(result).toMatch(/data-icon="squares"|<svg[^>]*data-icon="squares"/);
    expect(result).toMatch(
      /data-icon="copy-check"|<svg[^>]*data-icon="copy-check"/,
    );
    expect(result).toMatch(/data-icon="copy-x"|<svg[^>]*data-icon="copy-x"/);
  });
});
