
export enum ProjectStage {
  INITIATION = 'Initiation',
  MOU_SIGNED = 'MoU Signed',
  MOVED_TO_SITE = 'Moved to Site',
  COMPLETED = 'Completed',
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export enum ProjectLocation {
  KEFFI = 'Keffi',
  KARU = 'Karu',
  LAFIA = 'Lafia',
  DOMA = 'Doma',
  AKWANGA = 'Akwanga',
  AWE = 'Awe',
  KOKONA = 'Kokona',
  KEANA = 'Keana',
  OBI = 'Obi',
  WAMBA = 'Wamba',
  NASARAWA = 'Nasarawa',
  NASARAWA_EGGON = 'Nasarawa Eggon',
  TOTO = 'Toto',
}

export enum InvestmentType {
  DDI = 'DDI', // Domestic Direct Investment
  FDI = 'FDI', // Foreign Direct Investment
  MIXED = 'Mixed',
}

export interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  focalPersonName: string;
  focalPersonPhone: string;
  focalPersonEmail: string;
  projectStage: ProjectStage;
  projectLocation: ProjectLocation;
  projectSubLocation: string;
  projectSector: string;
  jobsToBeCreated: number;
  investmentWorth: number;
  investmentType: InvestmentType;
  requiresFollowUp: boolean;
  // Audit Trail
  createdBy: string;
  lastModifiedBy: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  focalPersonName: string;
  focalPersonPhone: string;
  focalPersonEmail: string;
  projectStage: ProjectStage;
  projectLocation: ProjectLocation;
  projectSubLocation: string;
  projectSector: string;
  jobsToBeCreated: number;
  investmentWorth: number;
  investmentType: InvestmentType;
  requiresFollowUp: boolean;
}
