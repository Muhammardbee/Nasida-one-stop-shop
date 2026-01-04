
import React, { useState, useEffect, useMemo, memo } from 'react';
import { Project, ProjectFormData, ProjectStage, ProjectLocation, InvestmentType } from '../types';
import { PROJECT_STAGE_OPTIONS, PROJECT_LOCATION_OPTIONS, INVESTMENT_TYPE_OPTIONS, PREDEFINED_SECTORS } from '../constants';
import { XMarkIcon, PencilSquareIcon, FlagIcon, DocumentTextIcon } from './icons';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  existingProjects: Project[];
}

// Memoized InputField defined outside to prevent focus loss and unnecessary re-renders
const InputField = memo(({
  label, 
  name, 
  value, 
  error, 
  type = "text", 
  isTextarea = false, 
  placeholder, 
  required = false, 
  list, 
  onChange
}: {
  label: string, 
  name: keyof ProjectFormData, 
  value: string | number, 
  error?: string, 
  type?: string, 
  isTextarea?: boolean, 
  placeholder?: string, 
  required?: boolean, 
  list?: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}) => (
  <div className="relative">
    <label htmlFor={`edit-form-${name}`} className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {isTextarea ? (
      <textarea
        id={`edit-form-${name}`}
        name={name}
        value={String(value)}
        onChange={onChange}
        rows={3}
        className={`mt-1 block w-full rounded-xl shadow-sm sm:text-sm transition-all border p-3 ${error ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary'}`}
      />
    ) : (
      <input
        type={type}
        id={`edit-form-${name}`}
        name={name}
        list={list}
        value={String(value)}
        onChange={onChange}
        className={`mt-1 block w-full rounded-xl shadow-sm sm:text-sm transition-all border p-3 ${error ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary'}`}
      />
    )}
    {error && <p className="mt-1 text-xs text-red-600 font-bold">{error}</p>}
  </div>
));

InputField.displayName = 'EditInputField';

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  project, 
  isOpen, 
  onClose, 
  onUpdateProject,
  existingProjects 
}) => {
  const [formData, setFormData] = useState<ProjectFormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        focalPersonName: project.focalPersonName,
        focalPersonPhone: project.focalPersonPhone,
        focalPersonEmail: project.focalPersonEmail,
        projectStage: project.projectStage,
        projectLocation: project.projectLocation,
        projectSubLocation: project.projectSubLocation,
        projectSector: project.projectSector,
        jobsToBeCreated: project.jobsToBeCreated,
        investmentWorth: project.investmentWorth,
        investmentType: project.investmentType,
        requiresFollowUp: project.requiresFollowUp,
      });
      setErrors({});
    }
  }, [isOpen, project]);

  const sectorSuggestions = useMemo(() => {
    const existingSectors = existingProjects
      .map(p => p.projectSector)
      .filter((s): s is string => typeof s === 'string' && s.trim() !== '');
    const merged = Array.from(new Set([...PREDEFINED_SECTORS, ...existingSectors]));
    return merged.sort();
  }, [existingProjects]);

  if (!isOpen || !project || !formData) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project Name is required.';
    } else if (formData.projectName.length < 3) {
      newErrors.projectName = 'Project Name must be at least 3 characters.';
    } else {
      const isDuplicate = existingProjects.some(
        p => p.id !== project.id && p.projectName.toLowerCase().trim() === formData.projectName.toLowerCase().trim()
      );
      if (isDuplicate) {
        newErrors.projectName = 'Another project with this name already exists.';
      }
    }
    if (!formData.projectSector.trim()) newErrors.projectSector = 'Project Sector is required.';
    if (!formData.focalPersonName.trim()) newErrors.focalPersonName = 'Focal Person Name is required.';

    if (formData.focalPersonEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.focalPersonEmail)) {
        newErrors.focalPersonEmail = 'Please enter a valid email address.';
      }
    }

    if (formData.focalPersonPhone) {
      const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,5}\)?[\s-]?)?[\d\s-]{5,16}$/;
      if (!phoneRegex.test(formData.focalPersonPhone)) {
        newErrors.focalPersonPhone = 'Invalid phone format.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    if (type === 'checkbox') processedValue = (e.target as HTMLInputElement).checked;
    else if (name === 'jobsToBeCreated' || name === 'investmentWorth') {
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    setFormData(prev => prev ? ({ ...prev, [name]: processedValue }) : null);
    
    setErrors(prev => {
        if (prev[name as keyof ProjectFormData]) {
          const newErrors = { ...prev };
          delete newErrors[name as keyof ProjectFormData];
          return newErrors;
        }
        return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onUpdateProject(project.id, formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto" aria-labelledby="edit-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          
          <div className="bg-nasida-green-900 px-6 py-4 flex justify-between items-center border-b border-nasida-green-800">
            <h3 className="text-xl font-black text-white flex items-center" id="edit-modal-title">
              <PencilSquareIcon className="w-6 h-6 mr-3" />
              Edit Project Data
            </h3>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
            <InputField label="Project Name" name="projectName" value={formData.projectName} error={errors.projectName} required onChange={handleChange} />
            <InputField label="Project Description" name="projectDescription" value={formData.projectDescription} isTextarea onChange={handleChange} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-form-projectStage">Project Stage</label>
                <select id="edit-form-projectStage" name="projectStage" value={formData.projectStage} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary focus:ring-primary">
                  {PROJECT_STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5" htmlFor="edit-form-projectLocation">Project Location</label>
                <select id="edit-form-projectLocation" name="projectLocation" value={formData.projectLocation} onChange={handleChange} className="block w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-primary focus:ring-primary">
                  {PROJECT_LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Project Sector" name="projectSector" value={formData.projectSector} error={errors.projectSector} required list="edit-sector-suggestions" onChange={handleChange} />
              <datalist id="edit-sector-suggestions">
                {sectorSuggestions.map(s => <option key={s} value={s} />)}
              </datalist>
              <InputField label="Sub-Location" name="projectSubLocation" value={formData.projectSubLocation} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Jobs (Target)" name="jobsToBeCreated" value={formData.jobsToBeCreated} type="number" onChange={handleChange} />
              <InputField label="Worth ($)" name="investmentWorth" value={formData.investmentWorth} type="number" onChange={handleChange} />
            </div>

            <div className="flex items-center space-x-3 bg-nasida-green-900/[0.03] p-4 rounded-xl border border-nasida-green-900/10">
              <input type="checkbox" id="edit-form-requiresFollowUp" name="requiresFollowUp" checked={formData.requiresFollowUp} onChange={handleChange} className="h-5 w-5 text-nasida-green-900 border-gray-300 rounded focus:ring-primary" />
              <label htmlFor="edit-form-requiresFollowUp" className="text-sm font-black text-gray-700 uppercase tracking-tight flex items-center">
                <FlagIcon className="w-4 h-4 mr-2" /> Mark for Follow-Up Review
              </label>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Focal Person Oversight</h4>
              <InputField label="Contact Name" name="focalPersonName" value={formData.focalPersonName} error={errors.focalPersonName} required onChange={handleChange} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Phone" name="focalPersonPhone" value={formData.focalPersonPhone} type="tel" onChange={handleChange} />
                <InputField label="Email" name="focalPersonEmail" value={formData.focalPersonEmail} type="email" onChange={handleChange} />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-100 mt-6">
              <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-nasida-green-900 text-white text-sm font-black rounded-xl shadow-lg hover:bg-opacity-90 active:scale-95 transition-all">
                Save Changes
              </button>
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-black rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
