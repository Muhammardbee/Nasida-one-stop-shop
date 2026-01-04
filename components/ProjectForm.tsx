
import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Project, ProjectFormData, ProjectStage, ProjectLocation, InvestmentType } from '../types';
import { PROJECT_STAGE_OPTIONS, PROJECT_LOCATION_OPTIONS, INVESTMENT_TYPE_OPTIONS, PREDEFINED_SECTORS } from '../constants';
import { PlusIcon, DocumentTextIcon, ArrowUpTrayIcon, XMarkIcon, FlagIcon, ExclamationTriangleIcon, CheckIcon } from './icons';

interface ProjectFormProps {
  onAddProject: (project: ProjectFormData) => void;
  onBulkAddProjects: (projects: Project[]) => void;
  existingProjects: Project[];
  currentUser: string;
}

interface ImportSummary {
  successCount: number;
  totalRows: number;
  errors: string[];
}

const AUTOSAVE_KEY = 'nasida_project_form_draft_v1';

const initialFormState: ProjectFormData = {
  projectName: '',
  projectDescription: '',
  focalPersonName: '',
  focalPersonPhone: '',
  focalPersonEmail: '',
  projectStage: ProjectStage.INITIATION,
  projectLocation: ProjectLocation.KEFFI,
  projectSubLocation: '',
  projectSector: '',
  jobsToBeCreated: 0,
  investmentWorth: 0,
  investmentType: InvestmentType.DDI,
  requiresFollowUp: false,
};

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
    <label htmlFor={`add-form-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
    {isTextarea ? (
      <textarea
        id={`add-form-${name}`}
        name={name}
        value={String(value)}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-all border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
      />
    ) : (
      <input
        type={type}
        id={`add-form-${name}`}
        name={name}
        list={list}
        value={String(value)}
        onChange={onChange}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-all border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
      />
    )}
    {error && (
      <p role="alert" className="mt-1 text-xs text-red-600 font-medium">
        {error}
      </p>
    )}
  </div>
));

InputField.displayName = 'InputField';

const ProjectForm: React.FC<ProjectFormProps> = ({ onAddProject, onBulkAddProjects, existingProjects, currentUser }) => {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [isRestored, setIsRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Compute merged unique sectors for autocomplete
  const sectorSuggestions = useMemo(() => {
    const existingSectors = existingProjects
      .map(p => p.projectSector)
      .filter((s): s is string => typeof s === 'string' && s.trim() !== '');
    
    const merged = Array.from(new Set([...PREDEFINED_SECTORS, ...existingSectors]));
    return merged.sort();
  }, [existingProjects]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(AUTOSAVE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.projectName || draft.projectDescription || draft.focalPersonName || draft.projectSector) {
          setFormData(prev => ({ ...prev, ...draft }));
          setIsRestored(true);
          const timer = setTimeout(() => setIsRestored(false), 6000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Failed to parse project form draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const isInitialState = JSON.stringify(formData) === JSON.stringify(initialFormState);
    
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    if (!isInitialState) {
      saveTimeoutRef.current = window.setTimeout(() => {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }, 1500);
    }

    return () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, [formData]);

  const handleDiscardDraft = () => {
    if (window.confirm('Discard the restored draft and start fresh?')) {
      setFormData(initialFormState);
      localStorage.removeItem(AUTOSAVE_KEY);
      setIsRestored(false);
      setLastSaved(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};
    
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project Name is required.';
    } else if (formData.projectName.length < 3) {
      newErrors.projectName = 'Project Name must be at least 3 characters.';
    } else {
      const isDuplicate = existingProjects.some(
        p => p.projectName.toLowerCase().trim() === formData.projectName.toLowerCase().trim()
      );
      if (isDuplicate) {
        newErrors.projectName = 'A project with this name already exists.';
      }
    }

    if (!formData.projectSector.trim()) {
      newErrors.projectSector = 'Project Sector is required.';
    }

    if (!formData.focalPersonName.trim()) {
      newErrors.focalPersonName = 'Focal Person Name is required.';
    }

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

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'jobsToBeCreated' || name === 'investmentWorth') {
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Clear error only if one exists to avoid unnecessary state updates
    setErrors(prev => {
      if (prev[name as keyof ProjectFormData]) {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ProjectFormData];
        return newErrors;
      }
      return prev;
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      setFormData(initialFormState);
      localStorage.removeItem(AUTOSAVE_KEY);
      setErrors({});
      setLastSaved(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      onAddProject(formData);
      setFormData(initialFormState);
      localStorage.removeItem(AUTOSAVE_KEY);
      setErrors({});
      setLastSaved(null);
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        setImportResult({ successCount: 0, totalRows: 0, errors: ["The file is empty or missing data rows."] });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const newProjects: Project[] = [];
      const importErrors: string[] = [];
      const now = new Date().toISOString();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const rowNumber = i + 1;
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        const pData: any = {};
        
        headers.forEach((header, index) => {
          const val = values[index];
          if (!val) return;
          if (header.includes('name') && header.includes('project')) pData.projectName = val;
          else if (header.includes('description')) pData.projectDescription = val;
          else if (header.includes('stage')) pData.projectStage = val;
          else if (header.includes('sector')) pData.projectSector = val;
          else if (header.includes('location') && !header.includes('sub')) pData.projectLocation = val;
          else if (header.includes('sub-location') || header.includes('sublocation')) pData.projectSubLocation = val;
          else if (header.includes('worth') || header.includes('investment')) pData.investmentWorth = parseFloat(val);
          else if (header.includes('jobs')) pData.jobsToBeCreated = parseInt(val, 10);
          else if (header.includes('type')) pData.investmentType = val;
          else if (header.includes('focal') && header.includes('name')) pData.focalPersonName = val;
          else if (header.includes('focal') && header.includes('phone')) pData.focalPersonPhone = val;
          else if (header.includes('focal') && header.includes('email')) pData.focalPersonEmail = val;
          else if (header.includes('follow') || header.includes('up')) pData.requiresFollowUp = val?.toLowerCase() === 'true' || val === '1' || val?.toLowerCase() === 'yes';
        });

        const rowErrors: string[] = [];
        if (!pData.projectName?.trim()) rowErrors.push("Missing Project Name");
        if (!pData.projectSector?.trim()) rowErrors.push("Missing Project Sector");
        if (!pData.focalPersonName?.trim()) rowErrors.push("Missing Focal Person Name");
        
        const isDuplicate = existingProjects.some(p => p.projectName.toLowerCase().trim() === pData.projectName?.toLowerCase().trim()) || 
                           newProjects.some(p => p.projectName.toLowerCase().trim() === pData.projectName?.toLowerCase().trim());
        if (isDuplicate) rowErrors.push(`Duplicate Name: "${pData.projectName}"`);

        if (rowErrors.length > 0) {
          importErrors.push(`Row ${rowNumber}: ${rowErrors.join(', ')}`);
          continue;
        }

        const stage = Object.values(ProjectStage).includes(pData.projectStage) ? pData.projectStage : ProjectStage.INITIATION;
        const location = Object.values(ProjectLocation).includes(pData.projectLocation) ? pData.projectLocation : ProjectLocation.LAFIA;
        const invType = Object.values(InvestmentType).includes(pData.investmentType) ? pData.investmentType : InvestmentType.DDI;

        newProjects.push({
          id: crypto.randomUUID(),
          projectName: pData.projectName.trim(),
          projectDescription: pData.projectDescription || '',
          projectStage: stage as ProjectStage,
          projectSector: pData.projectSector || 'General',
          projectLocation: location as ProjectLocation,
          projectSubLocation: pData.projectSubLocation || '',
          investmentWorth: isNaN(pData.investmentWorth) ? 0 : pData.investmentWorth,
          jobsToBeCreated: isNaN(pData.jobsToBeCreated) ? 0 : pData.jobsToBeCreated,
          investmentType: invType as InvestmentType,
          focalPersonName: pData.focalPersonName.trim(),
          focalPersonPhone: pData.focalPersonPhone || '',
          focalPersonEmail: pData.focalPersonEmail || '',
          requiresFollowUp: !!pData.requiresFollowUp,
          createdBy: currentUser,
          lastModifiedBy: currentUser,
          createdAt: now,
          updatedAt: now,
        });
      }

      setImportResult({
        successCount: newProjects.length,
        totalRows: lines.length - 1,
        errors: importErrors
      });

      if (newProjects.length > 0) {
        onBulkAddProjects(newProjects);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setImportResult({ successCount: 0, totalRows: 0, errors: ["Failed to read file. Please ensure it is a valid CSV."] });
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative overflow-hidden" role="region" aria-labelledby="form-title">
      {isRestored && (
        <div className="absolute top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-500">
           <div className="bg-nasida-green-900 text-white px-4 py-3 flex items-center justify-between shadow-xl">
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Unfinished Draft Restored</span>
             </div>
             <div className="flex items-center space-x-3">
               <button onClick={handleDiscardDraft} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded border border-white/20 transition-colors uppercase font-black">Discard</button>
               <button onClick={() => setIsRestored(false)} className="hover:text-green-200"><XMarkIcon className="w-4 h-4" /></button>
             </div>
           </div>
        </div>
      )}

      {importResult && (
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
           <div className={`p-4 rounded-xl border ${importResult.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {importResult.errors.length > 0 ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  ) : (
                    <CheckIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  )}
                  <h4 className={`text-sm font-black uppercase tracking-tight ${importResult.errors.length > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    Import {importResult.errors.length > 0 ? 'Incomplete' : 'Success'}
                  </h4>
                </div>
                <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-4 h-4" /></button>
              </div>
              <p className="mt-1 text-xs text-gray-700 font-medium">
                Successfully added <span className="font-bold">{importResult.successCount}</span> of <span className="font-bold">{importResult.totalRows}</span> projects.
              </p>
              
              {importResult.errors.length > 0 && (
                <div className="mt-3">
                   <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1.5">Error Log:</p>
                   <div className="max-h-32 overflow-y-auto bg-white/50 rounded-lg p-2 border border-red-100 space-y-1.5 custom-scrollbar">
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-[10px] text-red-700 leading-tight border-l-2 border-red-300 pl-2">
                           {err}
                        </p>
                      ))}
                   </div>
                   <p className="mt-2 text-[9px] text-red-600 italic">Please correct these rows in your CSV and try again.</p>
                </div>
              )}
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 id="form-title" className="text-2xl font-semibold text-gray-800 flex items-center">
          <DocumentTextIcon className="w-7 h-7 mr-2 text-primary" aria-hidden="true" />
          Add New Project
        </h2>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleCSVImport} accept=".csv" className="hidden" id="csv-upload" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center text-xs font-bold text-primary hover:text-nasida-green-900 transition-colors uppercase tracking-wider"
          >
            <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Import CSV
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField label="Project Name" name="projectName" value={formData.projectName} error={errors.projectName} required placeholder="e.g., Solar Farm Phase 1" onChange={handleChange} />
        <InputField label="Project Description" name="projectDescription" value={formData.projectDescription} error={errors.projectDescription} isTextarea placeholder="Enter a brief project overview..." onChange={handleChange}/>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-form-projectStage" className="block text-sm font-medium text-gray-700 mb-1">Project Stage*</label>
            <select id="add-form-projectStage" name="projectStage" value={formData.projectStage} onChange={handleChange} className="block w-full rounded-md shadow-sm sm:text-sm border border-gray-300 focus:border-primary focus:ring-primary">
              {PROJECT_STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="add-form-projectLocation" className="block text-sm font-medium text-gray-700 mb-1">Project Location*</label>
            <select id="add-form-projectLocation" name="projectLocation" value={formData.projectLocation} onChange={handleChange} className="block w-full rounded-md shadow-sm sm:text-sm border border-gray-300 focus:border-primary focus:ring-primary">
              {PROJECT_LOCATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Project Sector" name="projectSector" value={formData.projectSector} error={errors.projectSector} required list="sector-suggestions" placeholder="e.g., Agriculture, Energy" onChange={handleChange} />
          <datalist id="sector-suggestions">{sectorSuggestions.map(sector => (<option key={sector} value={sector} />))}</datalist>
          <InputField label="Project Sub-Location" name="projectSubLocation" value={formData.projectSubLocation} error={errors.projectSubLocation} placeholder="e.g., Angwan Maina" onChange={handleChange}/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Jobs to be Created" name="jobsToBeCreated" value={formData.jobsToBeCreated} error={errors.jobsToBeCreated} type="number" onChange={handleChange} />
          <InputField label="Investment Worth ($)" name="investmentWorth" value={formData.investmentWorth} error={errors.investmentWorth} type="number" onChange={handleChange} />
        </div>

        <div className="flex items-center space-x-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
            <div className="relative flex items-center h-5">
              <input id="add-form-requiresFollowUp" name="requiresFollowUp" type="checkbox" checked={formData.requiresFollowUp} onChange={handleChange} className="focus:ring-amber-500 h-5 w-5 text-amber-600 border-gray-300 rounded cursor-pointer" />
            </div>
            <div className="ml-3 text-sm flex items-center">
              <FlagIcon className={`w-4 h-4 mr-2 ${formData.requiresFollowUp ? 'text-amber-600 fill-amber-600' : 'text-gray-300'}`} />
              <label htmlFor="add-form-requiresFollowUp" className="font-bold text-gray-700 cursor-pointer flex items-center">
                Requires Follow-Up Oversight
                <span className="ml-2 text-[10px] text-amber-600 font-black uppercase tracking-widest">(Flag for Review)</span>
              </label>
            </div>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Focal Person Details</h3>
          <InputField label="Name" name="focalPersonName" value={formData.focalPersonName} error={errors.focalPersonName} required placeholder="Full Name" onChange={handleChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Phone" name="focalPersonPhone" value={formData.focalPersonPhone} error={errors.focalPersonPhone} type="tel" onChange={handleChange} />
            <InputField label="Email" name="focalPersonEmail" value={formData.focalPersonEmail} error={errors.focalPersonEmail} type="email" onChange={handleChange} />
          </div>
        </div>
        
        <div className="pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" className="flex-grow flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-md shadow-md text-white bg-primary hover:bg-opacity-90 transition-all active:scale-95">
                  <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Create Project
                </button>
                <button type="button" onClick={handleReset} className="px-6 py-3 border border-gray-300 text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95">Reset</button>
            </div>
            <div className="mt-3 flex items-center justify-end h-4">
              {lastSaved && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center animate-in fade-in duration-300">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
                  Draft Saved at {lastSaved}
                </p>
              )}
            </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
