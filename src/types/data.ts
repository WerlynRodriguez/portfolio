export interface RoleItem {
  title: string;
  company: string;
  location: string;
  period: {
    start: string;
    startLabel: string;
    end?: string;
    endLabel?: string;
  };
  duration?: string;
  summary: string;
  responsibilities: string[];
  primaryTech: string[];
  secondaryTech: string[];
}

export interface AcademicItem {
  title: string;
  period: {
    start: string;
    end: string;
  };
  description: string;
}

export interface SkillsData {
  frontendSkills: string[];
  backendSkills: string[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactData {
  email: string;
  socials: SocialLink[];
}
