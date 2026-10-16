import type {
  AcademicItem,
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
