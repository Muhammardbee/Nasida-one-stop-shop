
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, ProjectStage, InvestmentType, UserRole } from '../types';
import { STAGE_COLORS, STAGE_BG_COLORS, PROJECT_STAGE_OPTIONS, INVESTMENT_TYPE_OPTIONS } from '../constants';
import { 
  ListBulletIcon, 
  TrashIcon, 
  ArrowsUpDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  PencilSquareIcon,
  ChevronDownIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ClipboardIcon,
  CheckIcon,
  PlusIcon,
  ClockIcon,
  FlagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  EyeIcon
} from './icons';
import { BulkEditCategory } from './BulkEditModal';

type SortKey = 'projectName' | 'projectStage' | 'investmentWorth' | 'jobsToBeCreated' | 'projectLocation' | 'projectSector' | 'updatedAt' | 'createdAt' | 'id';
type SortOrder = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey | null;
  order: SortOrder;
}

interface ProjectTableProps {
  projects: Project[];
  userRole: UserRole;
  selectedIds: string[];
  onSelectionChange: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onProjectClick?: (project: Project) => void;
  onDeleteClick?: (project: Project) => void;
  onEditClick?: (project: Project) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onBulkEdit?: (category?: BulkEditCategory) => void;
  onBulkDelete?: () => void;
  onBulkExport?: (type: 'csv' | 'pdf') => void;
  onQuickExport?: (filteredProjects: Project[]) => void;
}

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatShortDate = (isoStr: string) => {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const STAGE_PROGRESS: Record<ProjectStage, number> = {
  [ProjectStage.INITIATION]: 25,
  [ProjectStage.MOU_SIGNED]: 50,
  [ProjectStage.MOVED_TO_SITE]: 75,
  [ProjectStage.COMPLETED]: 100,
};

const ProjectTable: React.FC<ProjectTableProps> = ({ 
  projects, 
  userRole, 
  selectedIds, 
  onSelectionChange, 
  onSelectAll, 
  onProjectClick, 
  onDeleteClick,
  onEditClick,
  onUpdateProject,
  onBulkEdit,
  onBulkDelete,
  onBulkExport,
  onQuickExport
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', order: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ projectId: string; field: 'projectStage' | 'investmentType' } | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const editRef = useRef<HTMLSelectElement>(null);
  const bulkMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === UserRole.ADMIN;
  const isEditor = userRole === UserRole.EDITOR || isAdmin;
  const isViewer = userRole === UserRole.VIEWER && !isEditor;

  useEffect(() => {
    if (editingCell && editRef.current) {
      editRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    if (isMobileSearchActive && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
        setIsBulkMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    } else if (sortConfig.key === key && sortConfig.order === 'desc') {
      order = null;
    }
    setSortConfig({ key: order ? key : null, order });
  };

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.projectName.toLowerCase().includes(lowerSearch) || 
        p.projectDescription.toLowerCase().includes(lowerSearch) ||
        p.projectSector.toLowerCase().includes(lowerSearch) ||
        p.projectLocation.toLowerCase().includes(lowerSearch) ||
        p.id.toLowerCase().includes(lowerSearch)
      );
    }

    if (sortConfig.key && sortConfig.order) {
      result.sort((a, b) => {
        const { key, order } = sortConfig;
        let valA = a[key as keyof Project];
        let valB = b[key as keyof Project];

        if (key === 'projectStage') {
          const orderMap = PROJECT_STAGE_OPTIONS.reduce((acc, stage, idx) => {
            acc[stage.value] = idx;
            return acc;
          }, {} as Record<string, number>);
          valA = orderMap[valA as string] ?? 0;
          valB = orderMap[valB as string] ?? 0;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (valA === valB) return 0;
        const comparison = valA < valB ? -1 : 1;
        return order === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [projects, searchTerm, sortConfig]);

  const allSelected = filteredAndSortedProjects.length > 0 && 
    filteredAndSortedProjects.every(p => selectedIds.includes(p.id));

  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredAndSortedProjects.map(p => p.id);
      const newSelection = Array.from(new Set([...selectedIds, ...visibleIds]));
      onSelectAll(newSelection);
    } else {
      const visibleIds = filteredAndSortedProjects.map(p => p.id);
      const newSelection = selectedIds.filter(id => !visibleIds.includes(id));
      onSelectAll(newSelection);
    }
  };

  const startEditing = (projectId: string, field: 'projectStage' | 'investmentType', e: React.MouseEvent) => {
    if (!isEditor) return;
    e.stopPropagation();
    setEditingCell({ projectId, field });
  };

  const handleInlineUpdate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (editingCell && onUpdateProject) {
      onUpdateProject(editingCell.projectId, { [editingCell.field]: e.target.value as any });
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingCell(null);
      setIsMobileSearchActive(false);
    }
    if (e.key === 'Enter' && editingCell && onUpdateProject && editRef.current) {
      onUpdateProject(editingCell.projectId, { [editingCell.field]: editRef.current.value as any });
      setEditingCell(null);
    }
  };

  const handleBlur = () => setEditingCell(null);

  const SortHeader: React.FC<{ label: string; sortKey: SortKey; className?: string; tooltip: string }> = ({ label, sortKey, className = "", tooltip }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th 
        scope="col" 
        className={`px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group ${className} ${isActive ? 'bg-primary/5' : ''}`}
        onClick={() => handleSort(sortKey)}
        title={tooltip}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          <span className={`transition-opacity ${isActive ? 'opacity-100 text-primary' : 'opacity-30 group-hover:opacity-100'}`}>
            {!isActive && <ArrowsUpDownIcon />}
            {isActive && sortConfig.order === 'asc' && <ArrowUpIcon />}
            {isActive && sortConfig.order === 'desc' && <ArrowDownIcon />}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
      <div className={`transition-all duration-300 ${selectedIds.length > 0 ? 'bg-nasida-green-900/5' : 'bg-white'}`}>
        {/* Desktop Header */}
        <div className="hidden lg:flex p-4 border-b border-gray-100 gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 flex-grow max-w-md">
            {selectedIds.length > 0 ? (
              <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
                <div className="bg-nasida-green-900 text-white p-2 rounded-lg shadow-md"><ListBulletIcon className="w-5 h-5" /></div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-nasida-green-900 leading-none">{selectedIds.length} Selected</span>
                  <button onClick={() => onSelectAll([])} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left hover:text-red-500 transition-colors">Clear Selection</button>
                </div>
              </div>
            ) : (
              <div className="relative group flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${searchTerm ? 'text-primary' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm"
                  placeholder="Search projects by name, sector, LGA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isViewer && (
              <button
                onClick={() => onQuickExport?.(filteredAndSortedProjects)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-nasida-green-900 border border-nasida-green-900/20 px-4 py-2.5 rounded-lg font-black text-xs transition-all shadow-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export Results</span>
              </button>
            )}

            {isEditor && selectedIds.length > 0 && (
              <div className="relative" ref={bulkMenuRef}>
                <button
                  onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                  className="flex items-center space-x-2 bg-nasida-green-900 hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-black text-sm transition-all shadow-lg"
                >
                  <span>Bulk Actions</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isBulkMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isBulkMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 z-[60] origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Actions</p>
                    </div>
                    <button onClick={() => { onBulkEdit?.('projectStage'); setIsBulkMenuOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-left">
                      <PencilSquareIcon className="w-4 h-4 mr-3 text-primary" /> Batch Edit Stage
                    </button>
                    <button onClick={() => { onBulkExport?.('csv'); setIsBulkMenuOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold text-left">
                      <ArrowDownTrayIcon className="w-4 h-4 mr-3 text-green-600" /> Export Detailed CSV
                    </button>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-50 my-1"></div>
                        <button onClick={() => { if (window.confirm(`Delete ${selectedIds.length} projects?`)) onBulkDelete?.(); setIsBulkMenuOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold text-left">
                          <TrashIcon className="w-4 h-4 mr-3 text-red-500" /> Delete Selected
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header - Refactored for Prominence */}
        <div className="lg:hidden">
           {isMobileSearchActive ? (
             <div className="p-3 bg-nasida-green-900 animate-in slide-in-from-top duration-300">
               <div className="relative flex items-center">
                 <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-green-300" />
                 <input
                   ref={mobileSearchInputRef}
                   type="text"
                   className="block w-full pl-10 pr-12 py-3 bg-white/10 border-0 rounded-2xl text-white placeholder-green-200 focus:ring-2 focus:ring-white/40 text-base"
                   placeholder="Search all records..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   onKeyDown={handleKeyDown}
                 />
                 <button 
                  onClick={() => { setIsMobileSearchActive(false); setSearchTerm(''); }}
                  className="absolute right-3 p-1 rounded-full bg-white/10 text-white"
                 >
                   <XMarkIcon className="w-5 h-5" />
                 </button>
               </div>
             </div>
           ) : (
             <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {selectedIds.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="bg-nasida-green-900 text-white px-2 py-1 rounded-lg text-xs font-black">{selectedIds.length}</div>
                      <button onClick={() => onSelectAll([])} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clear</button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Portfolio</h3>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={() => setIsMobileSearchActive(true)}
                    className={`p-2.5 rounded-xl transition-all ${searchTerm ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                   >
                     <MagnifyingGlassIcon className="w-6 h-6" />
                   </button>

                   {isEditor && selectedIds.length > 0 && (
                     <button 
                      onClick={() => onBulkEdit?.('projectStage')}
                      className="bg-nasida-green-900 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-lg"
                     >
                       Edit {selectedIds.length}
                     </button>
                   )}

                   {!isViewer && selectedIds.length === 0 && (
                     <button
                       onClick={() => onQuickExport?.(filteredAndSortedProjects)}
                       className="p-2.5 rounded-xl bg-gray-100 text-gray-500"
                     >
                       <ArrowDownTrayIcon className="w-6 h-6" />
                     </button>
                   )}
                </div>
             </div>
           )}
           
           {/* Mobile Search Active Breadcrumb/Filter Indicator */}
           {searchTerm && !isMobileSearchActive && (
             <div className="bg-nasida-green-50 px-4 py-2 flex items-center justify-between border-b border-nasida-green-100">
               <span className="text-[10px] font-bold text-nasida-green-900 uppercase tracking-widest truncate">
                 Filtering for: "{searchTerm}"
               </span>
               <button onClick={() => setSearchTerm('')} className="text-nasida-green-900"><XMarkIcon className="w-3 h-3" /></button>
             </div>
           )}
        </div>
      </div>

      <div className="flex-grow">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="p-12 text-center bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-lg font-bold">No matches found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms or filters.</p>
            {searchTerm && (
               <button 
                onClick={() => setSearchTerm('')} 
                className="mt-4 text-primary font-black uppercase text-xs tracking-widest hover:underline"
               >
                 Clear Search
               </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    {isEditor && (
                      <th scope="col" className="px-4 py-3 text-left w-10 border-b border-gray-200">
                         <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" checked={allSelected} onChange={handleSelectAllClick} />
                      </th>
                    )}
                    {isEditor && <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32 border-b border-gray-200">Actions</th>}
                    {!isViewer && <SortHeader label="Project ID" sortKey="id" tooltip="Internal ID" className="border-b border-gray-200" />}
                    <SortHeader label="Project Name" sortKey="projectName" tooltip="Sort by Name" className="border-b border-gray-200" />
                    <SortHeader label="Location" sortKey="projectLocation" tooltip="Sort by LGA" className="border-b border-gray-200" />
                    <SortHeader label="Sector" sortKey="projectSector" tooltip="Sort by Sector" className="border-b border-gray-200" />
                    <SortHeader label="Stage" sortKey="projectStage" tooltip="Sort by Stage" className="border-b border-gray-200" />
                    <SortHeader label="Jobs" sortKey="jobsToBeCreated" tooltip="Sort by Jobs" className="border-b border-gray-200" />
                    <SortHeader label="Worth ($)" sortKey="investmentWorth" tooltip="Sort by Worth" className="border-b border-gray-200" />
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">Type</th>
                    {isEditor && <SortHeader label="Updated" sortKey="updatedAt" tooltip="Last Modified" className="border-b border-gray-200" />}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredAndSortedProjects.map((project) => {
                    const isSelected = selectedIds.includes(project.id);
                    const isEditingStage = editingCell?.projectId === project.id && editingCell?.field === 'projectStage';
                    const isEditingType = editingCell?.projectId === project.id && editingCell?.field === 'investmentType';
                    const isCopied = copiedId === project.id;
                    const progress = STAGE_PROGRESS[project.projectStage] || 0;
                    
                    return (
                      <tr 
                        key={project.id} 
                        className={`transition-all duration-200 cursor-pointer group hover:bg-nasida-green-50/60 ${isSelected ? 'bg-primary/[0.04]' : project.requiresFollowUp ? 'bg-amber-50/30' : ''}`} 
                        onClick={() => onProjectClick && onProjectClick(project)}
                      >
                        {isEditor && (
                          <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                             <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer" checked={isSelected} onChange={() => onSelectionChange(project.id)} />
                          </td>
                        )}
                        {isEditor && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              <button onClick={(e) => { e.stopPropagation(); onEditClick && onEditClick(project); }} className="p-1.5 rounded-md text-gray-400 hover:text-nasida-green-900 hover:bg-green-50 transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                              <button onClick={(e) => { e.stopPropagation(); onQuickExport?.([project]); }} className="p-1.5 rounded-md text-gray-400 hover:text-nasida-green-900 hover:bg-green-50 transition-all"><ArrowDownTrayIcon className="w-5 h-5" /></button>
                              {isAdmin && <button onClick={(e) => { e.stopPropagation(); onDeleteClick && onDeleteClick(project); }} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><TrashIcon className="w-5 h-5" /></button>}
                            </div>
                          </td>
                        )}
                        {!isViewer && <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-gray-400">{project.id.split('-')[0]}...</td>}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${STAGE_BG_COLORS[project.projectStage]}`} />
                            {project.requiresFollowUp && <FlagIcon className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                            <span 
                                className="font-semibold text-sm text-gray-900 hover:text-primary hover:underline transition-all cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onProjectClick?.(project); }}
                            >
                                {project.projectName}
                            </span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onProjectClick?.(project); }} 
                                className="p-1 rounded-md text-gray-300 hover:text-primary transition-all"
                                title="View Full Report"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleCopy(project.id, project.projectName, e)} 
                                className={`p-1 rounded-md ${isCopied ? 'text-green-600' : 'text-gray-300 hover:text-primary'}`}
                                title="Copy Name"
                              >
                                {isCopied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.projectLocation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.projectSector || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => startEditing(project.id, 'projectStage', e)}>
                          {isEditingStage ? (
                            <select ref={editRef} value={project.projectStage} onChange={handleInlineUpdate} onBlur={handleBlur} onKeyDown={handleKeyDown} className="text-xs font-black border-2 border-primary rounded-lg px-2 py-1 outline-none w-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                               {PROJECT_STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full w-max ${STAGE_COLORS[project.projectStage]}`}>{project.projectStage}</span>
                              <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full ${STAGE_BG_COLORS[project.projectStage]}`} style={{ width: `${progress}%` }}></div></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 tabular-nums">{project.jobsToBeCreated || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 tabular-nums font-medium">{formatCurrency(project.investmentWorth)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700" onClick={(e) => startEditing(project.id, 'investmentType', e)}>
                          {isEditingType ? (
                            <select ref={editRef} value={project.investmentType} onChange={handleInlineUpdate} onBlur={handleBlur} onKeyDown={handleKeyDown} className="text-xs font-black border-2 border-primary rounded-lg px-2 py-1 outline-none w-full bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                               {INVESTMENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : <span className="font-bold">{project.investmentType}</span>}
                        </td>
                        {isEditor && <td className="px-6 py-4 whitespace-nowrap"><div className="flex flex-col"><span className="text-[10px] font-black text-gray-700 uppercase">{project.lastModifiedBy}</span><span className="text-[9px] text-gray-400 font-bold">{formatShortDate(project.updatedAt)}</span></div></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 bg-gray-50/80 space-y-4">
              {filteredAndSortedProjects.map(project => {
                const isSelected = selectedIds.includes(project.id);
                const isCopied = copiedId === project.id;
                const progress = STAGE_PROGRESS[project.projectStage] || 0;

                return (
                  <div key={project.id} className={`relative rounded-2xl shadow-md border transition-all duration-300 overflow-hidden ${isSelected ? 'bg-white border-primary ring-2 ring-primary ring-opacity-30' : project.requiresFollowUp ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'}`} onClick={() => onProjectClick && onProjectClick(project)}>
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isSelected ? 'bg-primary' : project.requiresFollowUp ? 'bg-amber-400' : 'bg-transparent'}`}></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-3 overflow-hidden flex-grow">
                          {isEditor && <div onClick={(e) => e.stopPropagation()} className="mt-1"><input type="checkbox" className="h-5 w-5 text-primary border-gray-300 rounded" checked={isSelected} onChange={() => onSelectionChange(project.id)} /></div>}
                          <div className="overflow-hidden w-full">
                            <div className="flex items-center space-x-2 mb-1.5">
                              {project.requiresFollowUp && <FlagIcon className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />}
                              <h3 
                                className="text-xl font-black text-gray-900 tracking-tight leading-tight truncate hover:text-primary transition-colors cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onProjectClick?.(project); }}
                              >
                                {project.projectName}
                              </h3>
                              <button onClick={(e) => handleCopy(project.id, project.projectName, e)} className={`p-1.5 rounded-md ${isCopied ? 'text-green-600' : 'text-gray-400'}`}>{isCopied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}</button>
                            </div>
                            <div className="flex flex-col space-y-3 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-transparent shadow-sm ${STAGE_COLORS[project.projectStage]}`}>{project.projectStage}</span>
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-wider border border-gray-200">{project.projectSector || 'General'}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner"><div className={`h-full ${STAGE_BG_COLORS[project.projectStage]}`} style={{ width: `${progress}%` }}></div></div>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{progress}% Completion</span>
                            </div>
                          </div>
                        </div>
                        {isEditor && (
                          <div className="flex flex-col space-y-2">
                             <button onClick={(e) => { e.stopPropagation(); onEditClick && onEditClick(project); }} className="p-2 rounded-full text-gray-400 hover:bg-green-50 transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                             {isAdmin && <button onClick={(e) => { e.stopPropagation(); onDeleteClick && onDeleteClick(project); }} className="p-2 rounded-full text-gray-400 hover:bg-red-50 transition-colors"><TrashIcon className="w-5 h-5" /></button>}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-green-50/60 p-3 rounded-2xl border border-green-100 flex items-center">
                          <CurrencyDollarIcon className="w-7 h-7 text-nasida-green-900 mr-3 flex-shrink-0" />
                          <div><span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Worth</span><span className="font-black text-nasida-green-900 text-base tabular-nums">{formatCurrency(project.investmentWorth)}</span></div>
                        </div>
                        <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100 flex items-center">
                          <UserGroupIcon className="w-7 h-7 text-blue-600 mr-3 flex-shrink-0" />
                          <div><span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Jobs</span><span className="font-black text-blue-700 text-base tabular-nums">{project.jobsToBeCreated || 0}</span></div>
                        </div>
                      </div>

                      {project.projectDescription && (
                        <div className="mb-5 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ring-1 ring-gray-100/50">
                           <div className="flex items-center mb-2">
                             <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-2" />
                             <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Project Overview</span>
                           </div>
                           <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                              {project.projectDescription}
                           </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-5 text-sm mb-5 px-1">
                        <div className="flex items-center text-gray-700"><MapPinIcon className="w-4 h-4 mr-2 text-gray-400" /><span className="font-bold text-xs">{project.projectLocation}</span></div>
                        <div className="flex items-center text-gray-700"><BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" /><span className="font-bold text-xs">{project.investmentType}</span></div>
                      </div>

                      <button className="w-full bg-nasida-green-900 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2" onClick={(e) => { e.stopPropagation(); onProjectClick && onProjectClick(project); }}>
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>VIEW FULL REPORT</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
