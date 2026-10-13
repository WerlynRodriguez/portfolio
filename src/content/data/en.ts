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
    'Semantic HTML5',
    'Modern CSS & Container Queries',
  ],
  backendSkills: [
    'Node.js',
    'REST & GraphQL APIs',
    'Database Architecture',
    'System Design',
  ],
};

export const academicItems: AcademicItem[] = [
  {
    title: 'B.S. in Computer Science',
    period: { start: '2020', end: '2024' },
    description:
      'Specialization in Software Engineering and Distributed Systems.',
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
