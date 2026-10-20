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
  institution: string;
  location: string;
  period: {
    start: string;
    startLabel: string;
    end: string;
    endLabel: string;
  };
  description: string;
}

export interface CertificateItem {
  name: string;
  issuer: string;
  url: string;
}

export interface SkillItem {
  title: string;
  description: string;
  primaryTech: string[];
  secondaryTech: string[];
}

export type SkillsData = SkillItem[];

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface ContactData {
  email: string;
  socials: SocialLink[];
}
