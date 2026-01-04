
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import jspdfAutotable from 'jspdf-autotable';
import { Project, ProjectFormData, ProjectStage, ProjectLocation, InvestmentType, UserRole, User } from './types';
import ProjectForm from './components/ProjectForm';
import ProjectTable from './components/ProjectTable';
import ProjectSummary from './components/ProjectSummary';
import FilterControls from './components/FilterControls';
import LoginModal from './components/LoginModal';
import UserManagementModal from './components/UserManagementModal';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import BulkEditModal, { BulkEditCategory } from './components/BulkEditModal';
import EditProjectModal from './components/EditProjectModal';
import RecentlyViewed from './components/RecentlyViewed';
import DisplayDashboard from './components/DisplayDashboard';
import { ALL_STAGES_FILTER, ALL_SECTORS_FILTER, STAGE_PROGRESS } from './constants';
import { 
  UserCircleIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  DocumentTextIcon, 
  ChevronDownIcon, 
  ShieldCheckIcon,
  PresentationChartLineIcon
} from './components/icons';

// Resolve autoTable function robustly to fix ESM default export issues
const autoTable = (jspdfAutotable as any).default || jspdfAutotable;

// Using the provided logo asset path as a direct relative path string
const NASIDA_LOGO = 'https://nasida.na.gov.ng/img/nasida-logo.0ba663ba.svg';

const initialProjects: Project[] = [
  { 
    id: crypto.randomUUID(), 
    projectName: 'Solar Farm Alpha', 
    projectDescription: '100MW solar farm development providing clean energy to Keffi and surrounding areas.', 
    focalPersonName: 'Alice Wonderland', 
    focalPersonPhone: '555-123-4567', 
    focalPersonEmail: 'alice@example.com', 
    projectStage: ProjectStage.INITIATION,
    projectLocation: ProjectLocation.KEFFI,
    projectSubLocation: 'Keffi GRA Extension',
    projectSector: 'Energy',
    jobsToBeCreated: 150,
    investmentWorth: 50000000,
    investmentType: InvestmentType.FDI,
    requiresFollowUp: true,
    createdBy: 'system',
    lastModifiedBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Wind Turbine Project Beta', 
    projectDescription: 'Regional wind turbine installation focused on renewable power generation in Karu.', 
    focalPersonName: 'Bob The Builder', 
    focalPersonPhone: '555-987-6543', 
    focalPersonEmail: 'bob@example.com', 
    projectStage: ProjectStage.MOU_SIGNED,
    projectLocation: ProjectLocation.KARU,
    projectSubLocation: 'Mararaba Hills',
    projectSector: 'Energy',
    jobsToBeCreated: 200,
    investmentWorth: 75000000,
    investmentType: InvestmentType.MIXED,
    requiresFollowUp: false,
    createdBy: 'system',
    lastModifiedBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Agri-Processing Hub Gamma', 
    projectDescription: 'Large scale cassava processing and starch production facility.', 
    focalPersonName: 'Carol Danvers', 
    focalPersonPhone: '555-111-2222', 
    focalPersonEmail: 'carol@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE,
    projectLocation: ProjectLocation.LAFIA,
    projectSubLocation: 'Shabu Industrial Area',
    projectSector: 'Agriculture',
    jobsToBeCreated: 300,
    investmentWorth: 25000000,
    investmentType: InvestmentType.DDI,
    requiresFollowUp: true,
    createdBy: 'system',
    lastModifiedBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 40 NEW PROJECTS START HERE
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lithium Mining Extraction A', 
    projectDescription: 'Primary lithium ore extraction and preliminary processing for battery-grade minerals.', 
    focalPersonName: 'Ibrahim Musa', focalPersonPhone: '0801-222-3333', focalPersonEmail: 'imusa@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.NASARAWA_EGGON, projectSubLocation: 'Eggon Hills',
    projectSector: 'Mining', jobsToBeCreated: 450, investmentWorth: 120000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lafia Smart Housing Estate', 
    projectDescription: 'Modern residential development featuring 500 units with integrated green technology.', 
    focalPersonName: 'Sarah John', focalPersonPhone: '0802-333-4444', focalPersonEmail: 'sjohn@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.LAFIA, projectSubLocation: 'Lafia North',
    projectSector: 'Real Estate', jobsToBeCreated: 1200, investmentWorth: 35000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Karu Gateway Tech Hub', 
    projectDescription: 'A world-class data center and technology incubation facility for startups.', 
    focalPersonName: 'David Chen', focalPersonPhone: '0803-444-5555', focalPersonEmail: 'dchen@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.KARU, projectSubLocation: 'New Karu',
    projectSector: 'ICT & Innovation', jobsToBeCreated: 800, investmentWorth: 45000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Toto Sugar Refinery', 
    projectDescription: 'Sugarcane plantation and refinery project aimed at domestic self-sufficiency.', 
    focalPersonName: 'Abubakar Sani', focalPersonPhone: '0804-555-6666', focalPersonEmail: 'asani@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.TOTO, projectSubLocation: 'Toto Central',
    projectSector: 'Agriculture', jobsToBeCreated: 2500, investmentWorth: 180000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Akwanga Rice Mill Complex', 
    projectDescription: 'Automated parboiling and milling facility for local rice varieties.', 
    focalPersonName: 'Grace Omale', focalPersonPhone: '0805-666-7777', focalPersonEmail: 'gomale@example.com', 
    projectStage: ProjectStage.COMPLETED, projectLocation: ProjectLocation.AKWANGA, projectSubLocation: 'Akwanga South',
    projectSector: 'Agriculture', jobsToBeCreated: 150, investmentWorth: 8500000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Barite Processing Plant', 
    projectDescription: 'Value-addition plant for barite used in oil-well drilling fluids.', 
    focalPersonName: 'Felix Obi', focalPersonPhone: '0806-777-8888', focalPersonEmail: 'fobi@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.AWE, projectSubLocation: 'Awe North',
    projectSector: 'Mining', jobsToBeCreated: 320, investmentWorth: 12500000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keffi Diagnostic Hospital', 
    projectDescription: 'State-of-the-art medical diagnostic center serving the western corridor.', 
    focalPersonName: 'Dr. Amina Bello', focalPersonPhone: '0807-888-9999', focalPersonEmail: 'abello@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KEFFI, projectSubLocation: 'Keffi East',
    projectSector: 'Healthcare', jobsToBeCreated: 240, investmentWorth: 18000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Nasarawa Marble Quarry', 
    projectDescription: 'Industrial extraction of high-quality marble for the construction industry.', 
    focalPersonName: 'Samuel Okoro', focalPersonPhone: '0808-999-0000', focalPersonEmail: 'sokoro@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.NASARAWA, projectSubLocation: 'Loko Road',
    projectSector: 'Mining', jobsToBeCreated: 500, investmentWorth: 22000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Wamba Hydro-Power Project', 
    projectDescription: 'Small-scale hydro-power generation for the Wamba industrial zone.', 
    focalPersonName: 'Emmanuel Audu', focalPersonPhone: '0809-000-1111', focalPersonEmail: 'eaudu@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.WAMBA, projectSubLocation: 'Farin Ruwa Falls',
    projectSector: 'Energy', jobsToBeCreated: 120, investmentWorth: 65000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Kokona Tin Smelter', 
    projectDescription: 'Processing facility for tin concentrates into high-purity ingots.', 
    focalPersonName: 'James Bond', focalPersonPhone: '0810-111-2222', focalPersonEmail: 'jbond@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KOKONA, projectSubLocation: 'Garaku',
    projectSector: 'Mining', jobsToBeCreated: 180, investmentWorth: 14000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keana Salt Industrial Park', 
    projectDescription: 'Modernization of traditional salt mining into industrial-scale production.', 
    focalPersonName: 'Mary Keana', focalPersonPhone: '0811-222-3333', focalPersonEmail: 'mkeana@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.KEANA, projectSubLocation: 'Salt Village',
    projectSector: 'Manufacturing', jobsToBeCreated: 900, investmentWorth: 28000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Obi Coal Mining Phase 2', 
    projectDescription: 'Sub-surface coal mining for the national power grid supply.', 
    focalPersonName: 'Umar Farouk', focalPersonPhone: '0812-333-4444', focalPersonEmail: 'ufarouk@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.OBI, projectSubLocation: 'Obi South',
    projectSector: 'Mining', jobsToBeCreated: 650, investmentWorth: 85000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Doma Irrigation Scheme', 
    projectDescription: 'Expansion of irrigation facilities for multi-cycle crop production.', 
    focalPersonName: 'Peter Pan', focalPersonPhone: '0813-444-5555', focalPersonEmail: 'ppan@example.com', 
    projectStage: ProjectStage.COMPLETED, projectLocation: ProjectLocation.DOMA, projectSubLocation: 'Doma Dam',
    projectSector: 'Agriculture', jobsToBeCreated: 3500, investmentWorth: 42000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keffi Students Mega Plaza', 
    projectDescription: 'Integrated retail and residential complex for university students.', 
    focalPersonName: 'Lucy Lu', focalPersonPhone: '0814-555-6666', focalPersonEmail: 'llu@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KEFFI, projectSubLocation: 'Keffi North',
    projectSector: 'Commerce & Retail', jobsToBeCreated: 350, investmentWorth: 12000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lafia Airport Logistics Hub', 
    projectDescription: 'Warehouse and distribution center for air-cargo operations.', 
    focalPersonName: 'Olawale Ade', focalPersonPhone: '0815-666-7777', focalPersonEmail: 'oade@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.LAFIA, projectSubLocation: 'Airport Road',
    projectSector: 'Transportation', jobsToBeCreated: 420, investmentWorth: 26000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Awe Ginger Processing Facility', 
    projectDescription: 'Modern plant for drying and grinding ginger for export markets.', 
    focalPersonName: 'Gift Opara', focalPersonPhone: '0816-777-8888', focalPersonEmail: 'gopara@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.AWE, projectSubLocation: 'Awe Central',
    projectSector: 'Agriculture', jobsToBeCreated: 280, investmentWorth: 5500000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Karu International Trade Mall', 
    projectDescription: 'Large scale shopping mall and trade exhibition center.', 
    focalPersonName: 'Tony Stark', focalPersonPhone: '0817-888-9999', focalPersonEmail: 'tstark@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KARU, projectSubLocation: 'Mararaba',
    projectSector: 'Commerce & Retail', jobsToBeCreated: 1500, investmentWorth: 60000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Eggon Hills Eco-Resort', 
    projectDescription: 'Sustainable tourism facility focusing on hiking and cultural heritage.', 
    focalPersonName: 'Martha Stewart', focalPersonPhone: '0818-999-0000', focalPersonEmail: 'mstewart@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.NASARAWA_EGGON, projectSubLocation: 'Peak Area',
    projectSector: 'Tourism', jobsToBeCreated: 150, investmentWorth: 7000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Nasarawa Textile Mill', 
    projectDescription: 'Textile manufacturing utilizing locally sourced cotton.', 
    focalPersonName: 'Hassan Lawal', focalPersonPhone: '0819-000-1111', focalPersonEmail: 'hlawal@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.NASARAWA, projectSubLocation: 'Industrial Zone',
    projectSector: 'Manufacturing', jobsToBeCreated: 1100, investmentWorth: 38000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Toto Cement Factory', 
    projectDescription: 'Full-scale cement production facility using local limestone deposits.', 
    focalPersonName: 'Wang Wei', focalPersonPhone: '0820-111-2222', focalPersonEmail: 'wwei@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.TOTO, projectSubLocation: 'Lime Hills',
    projectSector: 'Manufacturing', jobsToBeCreated: 2200, investmentWorth: 350000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Akwanga Vocational Academy', 
    projectDescription: 'Technical school for skills acquisition in renewable energy and IT.', 
    focalPersonName: 'Sister Mary', focalPersonPhone: '0821-222-3333', focalPersonEmail: 'smary@example.com', 
    projectStage: ProjectStage.COMPLETED, projectLocation: ProjectLocation.AKWANGA, projectSubLocation: 'Academy Way',
    projectSector: 'Education', jobsToBeCreated: 85, investmentWorth: 4000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Wamba Gold Prospecting', 
    projectDescription: 'Exploration project for gold deposits in the Wamba valley.', 
    focalPersonName: 'Gold Digger', focalPersonPhone: '0822-333-4444', focalPersonEmail: 'gdigger@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.WAMBA, projectSubLocation: 'Valley North',
    projectSector: 'Mining', jobsToBeCreated: 300, investmentWorth: 15000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Karu Broadband Expansion', 
    projectDescription: 'Fiber optic infrastructure deployment for ultra-fast internet in Karu.', 
    focalPersonName: 'Elon Mask', focalPersonPhone: '0823-444-5555', focalPersonEmail: 'emask@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.KARU, projectSubLocation: 'All Areas',
    projectSector: 'ICT & Innovation', jobsToBeCreated: 180, investmentWorth: 11000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Obi Fertilizer Plant', 
    projectDescription: 'Local production of NPK fertilizer for Nasarawa farmers.', 
    focalPersonName: 'Ali Baba', focalPersonPhone: '0824-555-6666', focalPersonEmail: 'ababa@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.OBI, projectSubLocation: 'Obi Industrial',
    projectSector: 'Agriculture', jobsToBeCreated: 420, investmentWorth: 19000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lafia Water Treatment Plant', 
    projectDescription: 'Modernization and expansion of the state capital\'s water supply system.', 
    focalPersonName: 'John Doe', focalPersonPhone: '0825-666-7777', focalPersonEmail: 'jdoe@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.LAFIA, projectSubLocation: 'Water Works',
    projectSector: 'Water Resources', jobsToBeCreated: 210, investmentWorth: 15000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keana Soy Processing', 
    projectDescription: 'Facility for soybean oil extraction and high-protein animal feed.', 
    focalPersonName: 'Bean Boy', focalPersonPhone: '0826-777-8888', focalPersonEmail: 'bboy@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KEANA, projectSubLocation: 'Soy Lane',
    projectSector: 'Agriculture', jobsToBeCreated: 310, investmentWorth: 9000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keffi Pharmaceutical Hub', 
    projectDescription: 'Manufacturing plant for essential generic medicines.', 
    focalPersonName: 'Med Man', focalPersonPhone: '0827-888-9999', focalPersonEmail: 'mman@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.KEFFI, projectSubLocation: 'Pharma Park',
    projectSector: 'Healthcare', jobsToBeCreated: 550, investmentWorth: 32000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Nasarawa Eggon Cashew Plant', 
    projectDescription: 'Processing and packaging of raw cashew nuts for international trade.', 
    focalPersonName: 'Nutt Guy', focalPersonPhone: '0828-999-0000', focalPersonEmail: 'nguy@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.NASARAWA_EGGON, projectSubLocation: 'Cashew Grove',
    projectSector: 'Agriculture', jobsToBeCreated: 600, investmentWorth: 13000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Doma Fish Farm Mega', 
    projectDescription: 'Integrated aquaculture and fish processing center at Doma Dam.', 
    focalPersonName: 'Fish Fan', focalPersonPhone: '0829-000-1111', focalPersonEmail: 'ffan@example.com', 
    projectStage: ProjectStage.COMPLETED, projectLocation: ProjectLocation.DOMA, projectSubLocation: 'Lake Side',
    projectSector: 'Agriculture', jobsToBeCreated: 450, investmentWorth: 6000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Kokona Brick Works', 
    projectDescription: 'Production of high-quality burnt bricks for sustainable construction.', 
    focalPersonName: 'Brick Layer', focalPersonPhone: '0830-111-2222', focalPersonEmail: 'blayer@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.KOKONA, projectSubLocation: 'Clay Pit',
    projectSector: 'Manufacturing', jobsToBeCreated: 220, investmentWorth: 4500000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Karu Warehouse District', 
    projectDescription: 'Logistics park with dry and cold storage facilities.', 
    focalPersonName: 'Store Keeper', focalPersonPhone: '0831-222-3333', focalPersonEmail: 'skeeper@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KARU, projectSubLocation: 'Gateway Road',
    projectSector: 'Transportation', jobsToBeCreated: 800, investmentWorth: 22000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lafia Solar Street Lighting', 
    projectDescription: 'Public-Private Partnership for city-wide smart solar lighting.', 
    focalPersonName: 'Light Up', focalPersonPhone: '0832-333-4444', focalPersonEmail: 'lup@example.com', 
    projectStage: ProjectStage.COMPLETED, projectLocation: ProjectLocation.LAFIA, projectSubLocation: 'Main City',
    projectSector: 'Energy', jobsToBeCreated: 65, investmentWorth: 3000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Nasarawa Poultry Hub', 
    projectDescription: 'Industrial poultry farm with automated hatchery and slaughterhouse.', 
    focalPersonName: 'Bird Man', focalPersonPhone: '0833-444-5555', focalPersonEmail: 'bman@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.NASARAWA, projectSubLocation: 'Farm Area 4',
    projectSector: 'Agriculture', jobsToBeCreated: 1200, investmentWorth: 16000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Keana Vegetable Canning', 
    projectDescription: 'Processing and canning facility for locally grown vegetables.', 
    focalPersonName: 'Can Can', focalPersonPhone: '0834-555-6666', focalPersonEmail: 'ccan@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.KEANA, projectSubLocation: 'Industrial Estate',
    projectSector: 'Manufacturing', jobsToBeCreated: 400, investmentWorth: 8500000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Toto Marble Phase 2', 
    projectDescription: 'Advanced tile cutting and polishing for export-grade marble.', 
    focalPersonName: 'Stone Cold', focalPersonPhone: '0835-666-7777', focalPersonEmail: 'scold@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.TOTO, projectSubLocation: 'North Quarry',
    projectSector: 'Mining', jobsToBeCreated: 350, investmentWorth: 18000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Akwanga Meat Processing', 
    projectDescription: 'Modern abattoir and cold-chain facility for beef and goat meat.', 
    focalPersonName: 'Butcher Bob', focalPersonPhone: '0836-777-8888', focalPersonEmail: 'bbob@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.AKWANGA, projectSubLocation: 'Gora Road',
    projectSector: 'Agriculture', jobsToBeCreated: 500, investmentWorth: 12000000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Karu E-Commerce Hub', 
    projectDescription: 'Fulfillment center for regional online marketplace operations.', 
    focalPersonName: 'Shop Fast', focalPersonPhone: '0837-888-9999', focalPersonEmail: 'sfast@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.KARU, projectSubLocation: 'Karu Central',
    projectSector: 'ICT & Innovation', jobsToBeCreated: 950, investmentWorth: 14000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Wamba Eco-Tourism Peak', 
    projectDescription: 'Mountain resort featuring zip-lining and eco-tours.', 
    focalPersonName: 'Peak Performance', focalPersonPhone: '0838-999-0000', focalPersonEmail: 'pperf@example.com', 
    projectStage: ProjectStage.MOU_SIGNED, projectLocation: ProjectLocation.WAMBA, projectSubLocation: 'The Heights',
    projectSector: 'Tourism', jobsToBeCreated: 220, investmentWorth: 9500000, investmentType: InvestmentType.MIXED,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Lafia Specialist School', 
    projectDescription: 'Private tertiary institution focused on agricultural science and engineering.', 
    focalPersonName: 'Prof. Agrop', focalPersonPhone: '0839-000-1111', focalPersonEmail: 'pagrop@example.com', 
    projectStage: ProjectStage.MOVED_TO_SITE, projectLocation: ProjectLocation.LAFIA, projectSubLocation: 'Education Hill',
    projectSector: 'Education', jobsToBeCreated: 180, investmentWorth: 21000000, investmentType: InvestmentType.DDI,
    requiresFollowUp: false, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  { 
    id: crypto.randomUUID(), 
    projectName: 'Obi Gas Turbine Small', 
    projectDescription: 'Capture and conversion of local gas pockets into electricity for local grid.', 
    focalPersonName: 'Gas Man', focalPersonPhone: '0840-111-2222', focalPersonEmail: 'gman@example.com', 
    projectStage: ProjectStage.INITIATION, projectLocation: ProjectLocation.OBI, projectSubLocation: 'Gas Field Alpha',
    projectSector: 'Energy', jobsToBeCreated: 140, investmentWorth: 44000000, investmentType: InvestmentType.FDI,
    requiresFollowUp: true, createdBy: 'system', lastModifiedBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

const defaultAdmin: User = {
  id: 'admin-1',
  username: 'admin',
  password: 'nasida',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
};

export interface ViewedProject {
  id: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  
  // Immersive display mode
  const [isDisplayDashboardOpen, setIsDisplayDashboardOpen] = useState(false);

  // User Management State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nasida_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse users", e);
      }
    }
    return [defaultAdmin];
  });

  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('investmentProjects');
    try {
        if (savedProjects) {
            let parsed = JSON.parse(savedProjects);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((p: any) => ({
                    id: p.id || crypto.randomUUID(),
                    projectName: p.projectName || '',
                    projectDescription: p.projectDescription || '',
                    focalPersonName: p.focalPersonName || '',
                    focalPersonPhone: p.focalPersonPhone || '',
                    focalPersonEmail: p.focalPersonEmail || '',
                    projectStage: p.projectStage || ProjectStage.INITIATION,
                    projectLocation: p.projectLocation || ProjectLocation.KEFFI,
                    projectSector: p.projectSector || '',
                    projectSubLocation: p.projectSubLocation || '',
                    jobsToBeCreated: typeof p.jobsToBeCreated === 'number' ? p.jobsToBeCreated : 0,
                    investmentWorth: typeof p.investmentWorth === 'number' ? p.investmentWorth : 0,
                    investmentType: p.investmentType || InvestmentType.DDI,
                    requiresFollowUp: !!p.requiresFollowUp,
                    createdBy: p.createdBy || 'system',
                    lastModifiedBy: p.lastModifiedBy || 'system',
                    createdAt: p.createdAt || new Date().toISOString(),
                    updatedAt: p.updatedAt || new Date().toISOString(),
                })) as Project[];
            }
        }
    } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
    }
    return initialProjects;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditCategory, setBulkEditCategory] = useState<BulkEditCategory>('projectStage');

  const [recentlyViewed, setRecentlyViewed] = useState<ViewedProject[]>(() => {
    const saved = localStorage.getItem('recentlyViewedProjects_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse recently viewed", e);
      }
    }
    return [];
  });
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [stageFilter, setStageFilter] = useState<ProjectStage | typeof ALL_STAGES_FILTER>(ALL_STAGES_FILTER);
  const [sectorFilter, setSectorFilter] = useState<string | typeof ALL_SECTORS_FILTER>(ALL_SECTORS_FILTER);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);

  const isAdmin = userRole === UserRole.ADMIN;
  const isEditor = userRole === UserRole.EDITOR || isAdmin;
  const isViewer = userRole === UserRole.VIEWER && !isEditor;

  useEffect(() => {
    localStorage.setItem('investmentProjects', JSON.stringify(projects));
    const uniqueSectors = Array.from(new Set(projects.map(p => p.projectSector))).filter((s): s is string => typeof s === 'string' && s.trim() !== '').sort();
    setAvailableSectors(uniqueSectors);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('recentlyViewedProjects_v2', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('nasida_users', JSON.stringify(users));
  }, [users]);

  const filterProjects = useCallback(() => {
    let tempProjects = [...projects];
    if (stageFilter !== ALL_STAGES_FILTER) {
      tempProjects = tempProjects.filter(p => p.projectStage === stageFilter);
    }
    if (sectorFilter !== ALL_SECTORS_FILTER) {
      tempProjects = tempProjects.filter(p => p.projectSector === sectorFilter);
    }
    setFilteredProjects(tempProjects);
    setSelectedProjectIds(prev => prev.filter(id => tempProjects.some(tp => tp.id === id)));
  }, [projects, stageFilter, sectorFilter]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const addProject = (projectData: ProjectFormData) => {
    const now = new Date().toISOString();
    const user = currentUser || 'guest';
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdBy: user,
      lastModifiedBy: user,
      createdAt: now,
      updatedAt: now,
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
  };

  const bulkAddProjects = (newProjects: Project[]) => {
    setProjects(prev => [...newProjects, ...prev]);
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    const now = new Date().toISOString();
    const user = currentUser || 'guest';
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates, lastModifiedBy: user, updatedAt: now } : p
    ));
    setProjectToEdit(null);
  };

  // User Management Handlers
  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const toggleSelection = (id: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedProjectIds(ids);
  };

  const handleBulkUpdate = (updates: Partial<Project>) => {
    const now = new Date().toISOString();
    const user = currentUser || 'guest';
    setProjects(prev => prev.map(p => 
      selectedProjectIds.includes(p.id) ? { ...p, ...updates, lastModifiedBy: user, updatedAt: now } : p
    ));
    setIsBulkEditModalOpen(false);
    setSelectedProjectIds([]);
  };

  const handleBulkDelete = () => {
    setProjects(prev => prev.filter(p => !selectedProjectIds.includes(p.id)));
    setSelectedProjectIds([]);
  };

  const exportProjectsToCSV = (data: Project[], filenameSuffix = 'export') => {
    if (!data.length) return;
    
    const formatDateCSV = (isoStr: string) => {
      if (!isoStr) return '';
      const date = new Date(isoStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const headers = [
      'Project ID',
      'Project Name',
      'Description',
      'Progress (%)',
      'Lifecycle Stage',
      'Sector',
      'LGA Location',
      'Sub-Location',
      'Investment Type',
      'Investment Worth ($)',
      'Jobs to be Created',
      'Requires Follow-Up',
      'Focal Person Name',
      'Focal Person Email',
      'Focal Person Phone',
      'Created By',
      'Created Date',
      'Last Modified By',
      'Last Modified Date'
    ];
    
    // Calculate Summary Values
    const totalWorth = data.reduce((sum, p) => sum + (p.investmentWorth || 0), 0);
    const totalJobs = data.reduce((sum, p) => sum + (p.jobsToBeCreated || 0), 0);

    const rows = data.map(p => [
      `"${p.id}"`,
      `"${p.projectName.replace(/"/g, '""')}"`,
      `"${p.projectDescription.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `${STAGE_PROGRESS[p.projectStage] || 0}`,
      `"${p.projectStage}"`,
      `"${p.projectSector}"`,
      `"${p.projectLocation}"`,
      `"${p.projectSubLocation.replace(/"/g, '""')}"`,
      `"${p.investmentType}"`,
      `${p.investmentWorth}`,
      `${p.jobsToBeCreated}`,
      `${p.requiresFollowUp ? 'YES' : 'NO'}`,
      `"${p.focalPersonName.replace(/"/g, '""')}"`,
      `"${p.focalPersonEmail}"`,
      `"${p.focalPersonPhone}"`,
      `"${p.createdBy}"`,
      `"${formatDateCSV(p.createdAt)}"`,
      `"${p.lastModifiedBy}"`,
      `"${formatDateCSV(p.updatedAt)}"`
    ].join(','));

    // Append Summary Footer Row
    const summaryRow = [
      '"TOTAL"',
      `"${data.length} Projects"`,
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      `${totalWorth}`,
      `${totalJobs}`,
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""'
    ].join(',');

    // Add BOM (\uFEFF) at the start for Excel encoding support
    const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasida_${filenameSuffix}_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportProjectsToPDF = (data: Project[]) => {
    if (!data.length) return;
    const doc = new jsPDF('landscape');
    const primaryColor = [0, 106, 62];
    const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("NASIDA Projects Report", 14, 20);
    
    const tableColumn = ["Project Name", "Stage", "Location", "Investment Worth ($)", "Jobs Created", "Modified By"];
    const tableRows = data.map(p => [
      p.projectName, p.projectStage, p.projectLocation, currencyFormatter.format(p.investmentWorth || 0), p.jobsToBeCreated || 0, p.lastModifiedBy
    ]);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: primaryColor as [number, number, number] },
    });

    doc.save(`nasida_report_${new Date().getTime()}.pdf`);
  };

  const handleBulkExport = (type: 'csv' | 'pdf') => {
    const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id));
    if (type === 'csv') {
        exportProjectsToCSV(selectedProjects, 'bulk_selected');
    } else {
        exportProjectsToPDF(selectedProjects);
    }
  };

  const exportAllToCSV = () => exportProjectsToCSV(projects, 'all_system');
  const exportAllToPDF = () => exportProjectsToPDF(projects);

  const confirmDeleteProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
    setRecentlyViewed(prev => prev.filter(item => item.id !== projectId));
  };

  const handleAdminClick = () => {
    if (currentUser) {
      setCurrentUser(null);
      setUserRole(UserRole.VIEWER);
      setSelectedProjectIds([]);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: string, role: UserRole) => {
    setCurrentUser(user);
    setUserRole(role);
    setIsLoginModalOpen(false);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== project.id);
      return [{ id: project.id, timestamp: Date.now() }, ...filtered].slice(0, 6);
    });
  };

  const handleDeleteRequest = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleEditRequest = (project: Project) => {
    setProjectToEdit(project);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 200);
  };

  return (
    <div className="min-h-screen bg-green-50/50 bg-hero-pattern flex flex-col font-sans">
      <header className="bg-nasida-green-900 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <img src={NASIDA_LOGO} alt="Nasida" className="h-10 sm:h-14 lg:h-20 w-auto object-contain" />
            <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                <div className="h-10 w-px bg-green-700/50"></div>
                <div className="flex flex-col justify-center text-white">
                    <span className="text-lg lg:text-2xl font-bold tracking-tight uppercase">ONE-STOP SHOP</span>
                    <span className="text-[10px] lg:text-xs text-green-200 uppercase tracking-wide">Investment Tracker</span>
                </div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* Public Display Button */}
            <button 
              onClick={() => setIsDisplayDashboardOpen(true)}
              className="text-xs sm:text-sm bg-nasida-green-500 hover:bg-nasida-green-700 text-white p-2 sm:py-1.5 sm:px-3 lg:px-4 rounded-full transition-all border border-nasida-green-400/50 flex items-center shadow-lg font-black uppercase tracking-wider group"
              title="Launch Office Slideshow Mode"
            >
              <PresentationChartLineIcon className="w-4 h-4 sm:mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">Public Display</span>
            </button>

            {isAdmin && (
              <button 
                onClick={() => setIsUserManagementOpen(true)}
                className="text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white p-2 sm:py-1.5 sm:px-3 rounded-full transition-all border border-white/30 flex items-center shadow-lg"
                title="Manage System Users"
              >
                <ShieldCheckIcon className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden lg:inline">Users</span>
              </button>
            )}
            
            {isEditor && (
              <div className="hidden md:flex items-center space-x-2">
                <button onClick={exportAllToPDF} className="text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-full transition-all border border-white/30 flex items-center" title="Export PDF"><DocumentTextIcon className="w-4 h-4" /></button>
                <button onClick={exportAllToCSV} className="text-xs bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-full transition-all border border-white/30 flex items-center" title="Export CSV"><ArrowDownTrayIcon className="w-4 h-4" /></button>
              </div>
            )}

            <button onClick={handleAdminClick} className="text-[10px] sm:text-xs lg:text-sm bg-white/10 hover:bg-white/20 text-white py-1.5 px-2.5 sm:px-3 rounded-full transition-all border border-white/30 font-bold uppercase tracking-tight">
              {currentUser ? 'Logout' : 'Admin'}
            </button>

            {currentUser && (
              <div className="flex items-center text-white">
                 <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                 <div className="ml-2 hidden lg:flex flex-col">
                    <span className="font-bold text-xs capitalize leading-none mb-0.5">{currentUser}</span>
                    <span className="text-[8px] uppercase tracking-widest text-green-300 font-black">{userRole}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-3 sm:p-6 lg:p-8 flex-grow pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-2 lg:order-1">
            {isEditor && (
              <ProjectForm onAddProject={addProject} onBulkAddProjects={bulkAddProjects} existingProjects={projects} currentUser={currentUser || 'guest'} />
            )}
            <RecentlyViewed recentlyViewed={recentlyViewed} allProjects={projects} onProjectClick={handleProjectClick} onClearHistory={() => setRecentlyViewed([])} />
            <ProjectSummary projects={projects} />
          </div>
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-1 lg:order-2">
            <FilterControls stageFilter={stageFilter} setStageFilter={setStageFilter} sectorFilter={sectorFilter} setSectorFilter={setSectorFilter} availableSectors={availableSectors} />
            <ProjectTable 
                projects={filteredProjects} 
                userRole={userRole} 
                selectedIds={selectedProjectIds} 
                onSelectionChange={toggleSelection} 
                onSelectAll={handleSelectAll} 
                onProjectClick={handleProjectClick} 
                onDeleteClick={handleDeleteRequest}
                onEditClick={handleEditRequest} 
                onUpdateProject={handleUpdateProject} 
                onBulkEdit={(cat) => {
                  setBulkEditCategory(cat || 'projectStage');
                  setIsBulkEditModalOpen(true);
                }} 
                onBulkDelete={handleBulkDelete}
                onBulkExport={handleBulkExport}
                onQuickExport={(filtered) => exportProjectsToCSV(filtered, filtered.length === 1 ? filtered[0].projectName.replace(/\s+/g, '_').toLowerCase() : 'filtered')}
            />
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-600 border-t border-green-100 mt-8 bg-white/80 px-4">
        <p className="font-semibold text-primary">NASIDA HQ</p>
        <p>Shendam Road, Lafia, Nasarawa State</p>
        <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">&copy; {new Date().getFullYear()} NASIDA One-Stop Shop.</p>
      </footer>

      {/* Presentation Mode Overlay */}
      {isDisplayDashboardOpen && (
        <DisplayDashboard 
            projects={projects} 
            onClose={() => setIsDisplayDashboardOpen(false)} 
        />
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLoginSuccess}
        users={users}
      />
      <UserManagementModal 
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateRole={handleUpdateUserRole}
      />
      <ProjectDetailsModal project={selectedProject} isOpen={isDetailsModalOpen} onClose={closeDetailsModal} userRole={userRole} onDeleteClick={handleDeleteRequest} onEditClick={handleEditRequest} />
      <DeleteConfirmationModal project={projectToDelete} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteProject} />
      <EditProjectModal project={projectToEdit} isOpen={!!projectToEdit} onClose={() => setProjectToEdit(null)} onUpdateProject={handleUpdateProject} existingProjects={projects} />
      <BulkEditModal 
        selectedCount={selectedProjectIds.length} 
        isOpen={isBulkEditModalOpen} 
        initialCategory={bulkEditCategory}
        onClose={() => setIsBulkEditModalOpen(false)} 
        onConfirm={handleBulkUpdate} 
      />
    </div>
  );
};

export default App;
