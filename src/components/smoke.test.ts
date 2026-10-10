import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Index from '../pages/index.astro';

describe('Astro Container API', () => {
  it('renders index page successfully', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Index);
    expect(result).toContain('Hello World');
  });
});
