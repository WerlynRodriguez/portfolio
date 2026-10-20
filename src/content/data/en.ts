import type {
  AcademicItem,
  ContactData,
  RoleItem,
  SkillsData,
} from '@/types/data';

export const experienceRoles: RoleItem[] = [
  {
    title: 'Android Engineer',
    company: 'Ultranic',
    location: 'Remote',
    period: {
      start: '2025-05',
      startLabel: 'May 2025',
      end: '2025-09',
      endLabel: 'Sep 2025',
    },
    summary:
      'Security patrol management app for guards and supervisors, shipped as one Kotlin Multiplatform codebase.',
    responsibilities: [
      'Patrol notifications and QR scanning to validate guard location at each checkpoint.',
      'Live tracking for supervisors across a dual-role system (guard and supervisor).',
      'Offline geolocation optimized with coroutines.',
      'Incident logging with PDF export and a real-time history view.',
    ],
    primaryTech: ['Kotlin', 'Jetpack Compose', '.NET'],
    secondaryTech: ['Room', 'Android Studio'],
  },
  {
    title: 'Full Stack Developer',
    company: 'Clínica Nancurunaisa',
    location: 'Nicaragua',
    period: {
      start: '2021-11',
      startLabel: 'Nov 2021',
      end: '2023-06',
      endLabel: 'Jun 2023',
    },
    summary:
      'Multi-user web platform with roles and scheduling for clinical therapy administration.',
    responsibilities: [
      'Frontend with role-protected routes and service calendar management.',
      'Digital billing pipeline: service data → automatic PDF → 90% reduction in printing costs.',
      'Real-time push notifications for appointment reminders.',
    ],
    primaryTech: ['React', '.NET', 'GraphQL'],
    secondaryTech: ['React Router', 'Microsoft SQL Server Express'],
  },
];

export const skillsData: SkillsData = [
  {
    title: 'Agentic AI',
    description:
      'I practically integrate large language models (LLMs) into real product workflows. I design and orchestrate autonomous agents leveraging modern harnesses like Claude Code or Antigravity.',
    primaryTech: ['LLM Integration', 'Agent Orchestration'],
    secondaryTech: ['RAG & Vector Databases', 'Tool Calling', 'AI Frameworks'],
  },
  {
    title: 'Frontend',
    description:
      'I build deterministic, fast interfaces designed for people. I focus on developing modular components and clean design systems that load fast.',
    primaryTech: ['TypeScript', 'React', 'Astro'],
    secondaryTech: [
      'Modern CSS',
      'Testing (Vitest & Playwright)',
      'Mobile Development',
    ],
  },
  {
    title: 'Backend',
    description:
      'I design and maintain the quiet logic powering daily business operations. I build APIs and data architectures focused on transactional integrity, seamless real-time sync, and high concurrency.',
    primaryTech: ['.NET (C#)', 'RESTful-APIs', 'SQL Server'],
    secondaryTech: ['Azure Cloud', 'SQLite', 'PostgreSQL'],
  },
  {
    title: 'Systems',
    description:
      'I work at a low level managing memory, processes, and Unix/Linux environments, ensuring services run on stable, secure foundations that maximize available resources.',
    primaryTech: ['C', 'Linux', 'Bash & Shell Scripts'],
    secondaryTech: [
      'Concurrency and Threads',
      'Networks (TCP/IP)',
      'Server Administration',
    ],
  },
];

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
