import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import SectionHeader from './SectionHeader.astro';

describe('SectionHeader component', () => {
  it('renders default h2 element and respects optional level="h1"', async () => {
    const container = await AstroContainer.create();
    const defaultResult = await container.renderToString(SectionHeader, {
      props: {
        prefix: '0x02',
        title: 'Work Experience',
        subtitle: 'Execution log.',
        id: 'experience-heading',
      },
    });

    expect(defaultResult).toContain('<h2');

    const h1Result = await container.renderToString(SectionHeader, {
      props: {
        prefix: '0x00',
        title: 'System',
        subtitle: 'Init',
        id: 'sys-heading',
        level: 'h1',
      },
    });

    expect(h1Result).toContain('<h1');
  });
});
