
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import jspdfAutotable from 'jspdf-autotable';
import { Project, ProjectFormData, ProjectStage, ProjectLocation, InvestmentType, UserRole } from './types';
import ProjectForm from './components/ProjectForm';
import ProjectTable from './components/ProjectTable';
import ProjectSummary from './components/ProjectSummary';
import FilterControls from './components/FilterControls';
import LoginModal from './components/LoginModal';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import BulkEditModal, { BulkEditCategory } from './components/BulkEditModal';
import EditProjectModal from './components/EditProjectModal';
import RecentlyViewed from './components/RecentlyViewed';
import { ALL_STAGES_FILTER, ALL_SECTORS_FILTER } from './constants';
import { UserCircleIcon, ArrowDownTrayIcon, TrashIcon, PencilSquareIcon, XMarkIcon, DocumentTextIcon, ChevronDownIcon } from './components/icons';

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
  }
];

export interface ViewedProject {
  id: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
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
    
    const csvContent = [
      headers.join(','),
      ...data.map(p => [
        `"${p.id}"`,
        `"${p.projectName.replace(/"/g, '""')}"`,
        `"${p.projectDescription.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
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
      ].join(','))
    ].join('\n');

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
          <div className="flex items-center space-x-6">
            <img src={NASIDA_LOGO} alt="Nasida" className="h-14 sm:h-20 w-auto object-contain" />
            <div className="hidden md:flex items-center space-x-6">
                <div className="h-10 w-px bg-green-700/50"></div>
                <div className="flex flex-col justify-center text-white">
                    <span className="text-2xl font-bold tracking-tight uppercase">ONE-STOP SHOP</span>
                    <span className="text-xs text-green-200 uppercase tracking-wide">Investment Tracker</span>
                </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {isEditor && (
              <>
                <button onClick={exportAllToPDF} className="text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-full transition-all border border-white/30 flex items-center shadow-lg"><DocumentTextIcon className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">Export PDF</span></button>
                <button onClick={exportAllToCSV} className="text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-full transition-all border border-white/30 flex items-center shadow-lg"><ArrowDownTrayIcon className="w-4 h-4 sm:mr-1.5" /><span className="hidden sm:inline">Export CSV</span></button>
              </>
            )}
            <button onClick={handleAdminClick} className="text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-full transition-all border border-white/30">{currentUser ? 'Logout' : 'Admin Login'}</button>
            {currentUser && (
              <div className="flex items-center text-white">
                 <UserCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 opacity-90" />
                 <div className="ml-2 hidden sm:flex flex-col">
                    <span className="font-bold text-xs capitalize leading-none mb-0.5">{currentUser}</span>
                    <span className="text-[8px] uppercase tracking-widest text-green-300 font-black">{userRole}</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-1">
            {isEditor && (
              <ProjectForm onAddProject={addProject} onBulkAddProjects={bulkAddProjects} existingProjects={projects} currentUser={currentUser || 'guest'} />
            )}
            <RecentlyViewed recentlyViewed={recentlyViewed} allProjects={projects} onProjectClick={handleProjectClick} onClearHistory={() => setRecentlyViewed([])} />
            <ProjectSummary projects={projects} />
          </div>
          <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2">
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

      <footer className="py-8 text-center text-sm text-gray-600 border-t border-green-100 mt-8 bg-white/80">
        <p className="font-semibold text-primary">NASIDA HQ</p>
        <p>Shendam Road, Lafia</p>
        <p className="mt-2 text-xs text-gray-400">&copy; {new Date().getFullYear()} NASIDA One-Stop Shop.</p>
      </footer>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginSuccess} />
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
