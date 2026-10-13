import type {
  AcademicItem,
  ContactData,
  RoleItem,
  SkillsData,
} from '@/types/data';

export const experienceRoles: RoleItem[] = [
  {
    title: 'Most recent Job',
    period: { start: '2024' },
    description: 'Desc here',
  },
  {
    title: 'Most relevant Job',
    period: { start: '2022', end: '2024' },
    description: 'Desc here',
  },
];

export const skillsData: SkillsData = {
  frontendSkills: [
    'Astro',
    'TypeScript',
    'HTML5 Semántico',
    'CSS Moderno y Container Queries',
  ],
  backendSkills: [
    'Node.js',
    'APIs REST y GraphQL',
    'Arquitectura de Bases de Datos',
    'Diseño de Sistemas',
  ],
};

export const academicItems: AcademicItem[] = [
  {
    title: 'Grado en Ingeniería Informática',
    period: { start: '2020', end: '2024' },
    description:
      'Especialización en Ingeniería de Software y Sistemas Distribuidos.',
  },
];

export const contactData: ContactData = {
  email: 'rdwerlynjose.16@gmail.com',
  socials: [
    { name: 'GitHub', url: 'https://github.com/', icon: 'github' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
    { name: 'WhatsApp', url: 'https://wa.me/', icon: 'whatsapp' },
  ],
};
