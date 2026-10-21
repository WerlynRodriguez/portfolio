import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      order: z.number().default(1),
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      highlights: z.array(z.string()).default([]),
      primaryTech: z.array(z.string()).default([]),
      secondaryTech: z.array(z.string()).default([]),
      achievement: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      repoUrl: z.url().optional(),
      demoUrl: z.string().optional(),
    }),
});

export const collections = {
  projects,
};
