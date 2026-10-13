import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repoUrl: z.url().optional(),
    demoUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  projects,
};
