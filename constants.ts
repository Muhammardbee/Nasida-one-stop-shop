
import { ProjectStage, ProjectLocation, InvestmentType } from './types';

export const PROJECT_STAGE_OPTIONS = [
  { value: ProjectStage.INITIATION, label: 'Initiation' },
  { value: ProjectStage.MOU_SIGNED, label: 'MoU Signed' },
  { value: ProjectStage.MOVED_TO_SITE, label: 'Moved to Site' },
  { value: ProjectStage.COMPLETED, label: 'Completed' },
];

export const PROJECT_LOCATION_OPTIONS = [
  { value: ProjectLocation.KEFFI, label: 'Keffi' },
  { value: ProjectLocation.KARU, label: 'Karu' },
  { value: ProjectLocation.LAFIA, label: 'Lafia' },
  { value: ProjectLocation.DOMA, label: 'Doma' },
  { value: ProjectLocation.AKWANGA, label: 'Akwanga' },
  { value: ProjectLocation.AWE, label: 'Awe' },
  { value: ProjectLocation.KOKONA, label: 'Kokona' },
  { value: ProjectLocation.KEANA, label: 'Keana' },
  { value: ProjectLocation.OBI, label: 'Obi' },
  { value: ProjectLocation.WAMBA, label: 'Wamba' },
  { value: ProjectLocation.NASARAWA, label: 'Nasarawa' },
  { value: ProjectLocation.NASARAWA_EGGON, label: 'Nasarawa Eggon' },
  { value: ProjectLocation.TOTO, label: 'Toto' },
];

export const INVESTMENT_TYPE_OPTIONS = [
  { value: InvestmentType.DDI, label: 'DDI (Domestic Direct Investment)' },
  { value: InvestmentType.FDI, label: 'FDI (Foreign Direct Investment)' },
  { value: InvestmentType.MIXED, label: 'Mixed' },
];

export const PREDEFINED_SECTORS = [
  'Agriculture',
  'Mining',
  'Energy',
  'ICT & Innovation',
  'Tourism',
  'Commerce & Retail',
  'Real Estate',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Solid Minerals',
  'Transportation',
  'Water Resources',
];

export const ALL_STAGES_FILTER = 'all_stages_filter_sentinel_value';
export const ALL_SECTORS_FILTER = 'all_sectors_filter_sentinel_value';

export const STAGE_COLORS: Record<ProjectStage, string> = {
  [ProjectStage.INITIATION]: 'bg-blue-100 text-blue-700',
  [ProjectStage.MOU_SIGNED]: 'bg-yellow-100 text-yellow-700',
  [ProjectStage.MOVED_TO_SITE]: 'bg-purple-100 text-purple-700',
  [ProjectStage.COMPLETED]: 'bg-green-100 text-green-700',
};

export const STAGE_BG_COLORS: Record<ProjectStage, string> = {
  [ProjectStage.INITIATION]: 'bg-blue-500',
  [ProjectStage.MOU_SIGNED]: 'bg-yellow-500',
  [ProjectStage.MOVED_TO_SITE]: 'bg-purple-500',
  [ProjectStage.COMPLETED]: 'bg-green-500',
};
