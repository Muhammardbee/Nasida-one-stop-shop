
import React from 'react';
import { Project, UserRole } from '../types';
import { STAGE_COLORS } from '../constants';
import { XMarkIcon, MapPinIcon, CurrencyDollarIcon, UserGroupIcon, BriefcaseIcon, UserCircleIcon, DocumentTextIcon, TrashIcon, PlusIcon, PencilSquareIcon, ClockIcon, FlagIcon } from './icons';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onDeleteClick?: (project: Project) => void;
  onEditClick?: (project: Project) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ project, isOpen, onClose, userRole, onDeleteClick, onEditClick }) => {
  if (!isOpen || !project) return null;

  const isAdmin = userRole === UserRole.ADMIN;
  const isEditor = userRole === UserRole.EDITOR || isAdmin;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          
          <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-start">
            <div className="flex-grow">
                <div className="flex items-center space-x-3 pr-8">
                  <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">{project.projectName}</h3>
                  {project.requiresFollowUp && (
                    <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                      <FlagIcon className="w-3 h-3 mr-1 fill-amber-600" />
                      Attention Needed
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${STAGE_COLORS[project.projectStage]}`}>{project.projectStage}</span>
                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">{project.projectSector}</span>
                </div>
            </div>
            <button 
                type="button" 
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none transition-colors" 
                onClick={onClose} 
                title="Close project report"
                aria-label="Close detailed report"
            >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Description</h4>
                    <p className="mt-1 text-sm text-gray-900 leading-relaxed">{project.projectDescription || "No description provided."}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Location</h4>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">{project.projectLocation}</p>
                        {project.projectSubLocation && <p className="text-xs text-gray-600">{project.projectSubLocation}</p>}
                    </div>
                </div>
                 <div className="flex items-start">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Investment Type</h4>
                        <p className="mt-1 text-sm text-gray-900 font-bold text-primary">{project.investmentType}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-center">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm mr-4" aria-hidden="true"><CurrencyDollarIcon className="h-6 w-6 text-nasida-green-900" /></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Investment Worth</p>
                        <p className="text-xl font-black text-gray-900">{formatCurrency(project.investmentWorth)}</p>
                    </div>
                </div>
                <div className="flex items-center">
                     <div className="p-2.5 bg-white rounded-xl shadow-sm mr-4" aria-hidden="true"><UserGroupIcon className="h-6 w-6 text-blue-600" /></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Jobs Created</p>
                        <p className="text-xl font-black text-gray-900">{formatNumber(project.jobsToBeCreated)}</p>
                    </div>
                </div>
            </div>

            {isEditor && (
                <div className="border-t border-gray-100 pt-5 space-y-6">
                    <div>
                        <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                            <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                            Focal Person Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl">
                            <div><p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Name</p><p className="font-semibold text-gray-900">{project.focalPersonName}</p></div>
                            <div><p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Phone</p><p className="font-semibold text-gray-900">{project.focalPersonPhone || 'N/A'}</p></div>
                            <div className="sm:col-span-2"><p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Email</p><p className="font-semibold text-gray-900">{project.focalPersonEmail || 'N/A'}</p></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center uppercase tracking-wider">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" aria-hidden="true" />
                            Audit Trail
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-nasida-green-900/5 p-4 rounded-xl border border-nasida-green-900/10 transition-all hover:bg-nasida-green-900/10">
                                <div className="flex items-center mb-2">
                                  <div className="bg-nasida-green-900 text-white p-1 rounded-md mr-2">
                                    <PlusIcon className="w-3 h-3" />
                                  </div>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Project Created</p>
                                </div>
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-white border border-nasida-green-900/20 text-nasida-green-900 capitalize w-max shadow-sm">
                                    {project.createdBy}
                                  </span>
                                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{formatDate(project.createdAt)}</span>
                                </div>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 transition-all hover:bg-blue-50">
                                <div className="flex items-center mb-2">
                                  <div className="bg-blue-600 text-white p-1 rounded-md mr-2">
                                    <PencilSquareIcon className="w-3 h-3" />
                                  </div>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Last Modified</p>
                                </div>
                                <div className="flex flex-col">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-white border border-blue-200 text-blue-700 capitalize w-max shadow-sm">
                                    {project.lastModifiedBy}
                                  </span>
                                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{formatDate(project.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
            <button 
                type="button" 
                className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-sm font-black text-gray-700 hover:bg-gray-50 sm:w-auto transition-colors" 
                onClick={onClose} 
            >
                Close
            </button>
            {isEditor && (
                <button 
                    type="button" 
                    className="w-full inline-flex items-center justify-center rounded-xl border border-nasida-green-900 shadow-sm px-5 py-2.5 bg-nasida-green-900 text-sm font-black text-white hover:bg-opacity-90 sm:w-auto transition-all" 
                    onClick={() => { onEditClick && onEditClick(project); onClose(); }} 
                >
                    <PencilSquareIcon className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Edit Project
                </button>
            )}
            {isAdmin && (
                <button 
                    type="button" 
                    className="mt-3 w-full inline-flex items-center justify-center rounded-xl border border-red-200 shadow-sm px-5 py-2.5 bg-red-50 text-sm font-black text-red-700 hover:bg-red-100 sm:mt-0 sm:w-auto transition-all" 
                    onClick={() => { onDeleteClick && onDeleteClick(project); onClose(); }} 
                >
                    <TrashIcon className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Delete Project
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
