import type {
  AcademicItem,
  CertificateItem,
  ContactData,
  RoleItem,
  SkillsData,
} from '@/types/data';

export const experienceRoles: RoleItem[] = [
  {
    title: 'Ingeniero Android',
    company: 'Ultranic',
    location: 'Remoto',
    period: {
      start: '2025-05',
      startLabel: 'Mayo 2025',
      end: '2025-09',
      endLabel: 'Sep 2025',
    },
    summary:
      'App de gestión de patrullaje de seguridad para guardias y supervisores, desarrollada en un único codebase Kotlin Multiplatform.',
    responsibilities: [
      'Notificaciones de rondas y escaneo QR para validar la ubicación del guardia en cada punto.',
      'Seguimiento en tiempo real para supervisores mediante un sistema de doble rol (guardia y supervisor).',
      'Geolocalización offline optimizada con corrutinas.',
      'Registro de incidentes con exportación a PDF y vista de historial en tiempo real.',
    ],
    primaryTech: ['Kotlin', 'Jetpack Compose', '.NET'],
    secondaryTech: ['Room', 'Android Studio'],
  },
  {
    title: 'Desarrollador Full Stack',
    company: 'Clínica Nancurunaisa',
    location: 'Nicaragua',
    period: {
      start: '2021-11',
      startLabel: 'Nov 2021',
      end: '2023-06',
      endLabel: 'Jun 2023',
    },
    summary:
      'Plataforma web multiusuario con roles y agenda para la gestión y administración de servicios terapéuticos.',
    responsibilities: [
      'Frontend con rutas protegidas por rol y gestión de calendario de atención.',
      'Pipeline de facturación digital: datos de servicio → PDF automático → reducción del 90% en costos de impresión.',
      'Notificaciones push en tiempo real para recordatorios de citas.',
    ],
    primaryTech: ['React', '.NET', 'GraphQL'],
    secondaryTech: ['React Router', 'Microsoft SQL Server Express'],
  },
];

export const skillsData: SkillsData = [
  {
    title: 'Agentic IA',
    description:
      'Puedo integrar de manera práctica modelos de lenguaje (LLM) en flujos de producto reales. Diseño y orquesto agentes autónomos apoyándome en arneses modernos como Claude Code o Antigravity.',
    primaryTech: ['Integración de LLMs', 'Orquestación de Agentes'],
    secondaryTech: [
      'RAG & Bases Vectoriales',
      'Tool Calling',
      'Frameworks de IA',
    ],
  },
  {
    title: 'Frontend',
    description:
      'Construyo interfaces deterministas, rápidas y pensadas para las personas. Me enfoco en desarrollar componentes modulares y sistemas de diseño limpios que cargan rápido.',
    primaryTech: ['TypeScript', 'React', 'Astro'],
    secondaryTech: [
      'CSS Moderno',
      'Testing (Vitest & Playwright)',
      'Desarrollo Móvil',
    ],
  },
  {
    title: 'Backend',
    description:
      'Soy capaz de diseñar y mantener la lógica silenciosa que sostiene la operación diaria del negocio. Desarrollo APIs y arquitecturas de datos enfocadas en integridad transaccional, sincronización fluida en tiempo real y alta concurrencia.',
    primaryTech: ['.NET (C#)', 'APIs RESTful', 'SQL Server'],
    secondaryTech: ['Azure Cloud', 'SQLite', 'PostgreSQL'],
  },
  {
    title: 'Sistemas',
    description:
      'Puedo trabajar a bajo nivel gestionando memoria, procesos y entornos Unix/Linux, garantizando que los servicios se ejecuten sobre bases estables, seguras y aprovechando al máximo los recursos disponibles.',
    primaryTech: ['C', 'Linux', 'Bash & Shell Scripts'],
    secondaryTech: [
      'Concurrencia e Hilos',
      'Redes (TCP/IP)',
      'Administración de Servidores',
    ],
  },
];

export const academicItems: AcademicItem[] = [
  {
    title: 'Campus de Programación',
    institution: '42 Madrid',
    location: 'España',
    period: {
      start: '2024-11',
      startLabel: 'Noviembre 2024',
      end: '2025-12',
      endLabel: 'Diciembre 2025',
    },
    description:
      'Formación intensiva en C y entornos Unix/Linux: gestión de procesos, forks, threads y memoria.',
  },
  {
    title: 'Curso de Inteligencia Artificial con Python',
    institution: 'Microsoft Reactor',
    location: 'Remoto',
    period: {
      start: '2025-09',
      startLabel: 'Septiembre 2025',
      end: '2025-10',
      endLabel: 'Octubre 2025',
    },
    description:
      'Construcción de aplicaciones de IA generativa con LLMs, visión por computadora, embeddings vectoriales y RAG.',
  },
  {
    title: 'Ingeniería en Computación',
    institution: 'Universidad Nacional de Ingeniería',
    location: 'Nicaragua',
    period: {
      start: '2019-01',
      startLabel: 'Enero 2019',
      end: '2023-12',
      endLabel: 'Diciembre 2023',
    },
    description:
      'Estructuras de datos, algoritmos, sistemas operativos, redes y arquitectura de software. GPA: 8.22/10.',
  },
];

export const certificateItems: CertificateItem[] = [
  {
    name: 'React',
    issuer: 'HackerRank',
    url: 'https://www.hackerrank.com/certificates/a287ed549a63',
  },
  {
    name: 'Google AI',
    issuer: 'Alura',
    url: 'https://credsverse.com/credentials/15c1e0d2-a762-43d4-a825-c4e39888439d?preview=1',
  },
  {
    name: 'Claude Code',
    issuer: 'Anthropic',
    url: 'https://verify.skilljar.com/c/xtxymg2vjjdr',
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
