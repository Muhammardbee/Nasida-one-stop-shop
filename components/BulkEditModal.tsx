
import React, { useState, useEffect } from 'react';
import { Project, ProjectStage, InvestmentType } from '../types';
import { PROJECT_STAGE_OPTIONS, INVESTMENT_TYPE_OPTIONS } from '../constants';
import { XMarkIcon, PencilSquareIcon, UserCircleIcon } from './icons';

export type BulkEditCategory = 'projectStage' | 'investmentType' | 'focalPerson';

interface BulkEditModalProps {
  selectedCount: number;
  isOpen: boolean;
  initialCategory?: BulkEditCategory;
  onClose: () => void;
  onConfirm: (updates: Partial<Project>) => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({ 
  selectedCount, 
  isOpen, 
  initialCategory = 'projectStage',
  onClose, 
  onConfirm 
}) => {
  const [editCategory, setEditCategory] = useState<BulkEditCategory>(initialCategory);
  
  // States for different categories
  const [stageValue, setStageValue] = useState<ProjectStage>(PROJECT_STAGE_OPTIONS[0].value as ProjectStage);
  const [typeValue, setTypeValue] = useState<InvestmentType>(INVESTMENT_TYPE_OPTIONS[0].value as InvestmentType);
  
  const [focalName, setFocalName] = useState('');
  const [focalPhone, setFocalPhone] = useState('');
  const [focalEmail, setFocalEmail] = useState('');

  // Sync category if prop changes (e.g. user clicks different menu item)
  useEffect(() => {
    if (isOpen) {
      setEditCategory(initialCategory);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    let updates: Partial<Project> = {};
    
    if (editCategory === 'projectStage') {
      updates.projectStage = stageValue;
    } else if (editCategory === 'investmentType') {
      updates.investmentType = typeValue;
    } else if (editCategory === 'focalPerson') {
      // Only include fields that have been typed in to avoid accidental clearing
      if (focalName.trim()) updates.focalPersonName = focalName.trim();
      if (focalPhone.trim()) updates.focalPersonPhone = focalPhone.trim();
      if (focalEmail.trim()) updates.focalPersonEmail = focalEmail.trim();
      
      if (Object.keys(updates).length === 0) {
        alert("Please fill in at least one focal person field to update.");
        return;
      }
    }
    
    onConfirm(updates);
    // Reset focal person fields for next use
    setFocalName('');
    setFocalPhone('');
    setFocalEmail('');
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="bg-primary/5 px-6 py-4 flex items-center border-b border-gray-100">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
              <PencilSquareIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900" id="modal-title">
              Bulk Edit Projects
            </h3>
            <button 
                type="button" 
                className="ml-auto bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                title="Cancel and close"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="bg-nasida-green-900/5 p-3 rounded-lg border border-nasida-green-900/10">
              <p className="text-xs text-nasida-green-900 font-bold">
                You are updating <span className="font-black underline">{selectedCount} selected projects</span> at once.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category to Update</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'projectStage', label: 'Lifecycle Stage' },
                  { id: 'investmentType', label: 'Investment Type' },
                  { id: 'focalPerson', label: 'Focal Person Details' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setEditCategory(cat.id as BulkEditCategory)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      editCategory === cat.id 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {editCategory === cat.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50">
              {editCategory === 'projectStage' && (
                <div>
                  <label htmlFor="stageValue" className="block text-sm font-bold text-gray-700 mb-1.5">New Stage</label>
                  <select
                    id="stageValue"
                    value={stageValue}
                    onChange={(e) => setStageValue(e.target.value as ProjectStage)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50/50"
                  >
                    {PROJECT_STAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              )}

              {editCategory === 'investmentType' && (
                <div>
                  <label htmlFor="typeValue" className="block text-sm font-bold text-gray-700 mb-1.5">New Investment Type</label>
                  <select
                    id="typeValue"
                    value={typeValue}
                    onChange={(e) => setTypeValue(e.target.value as InvestmentType)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50/50"
                  >
                    {INVESTMENT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              )}

              {editCategory === 'focalPerson' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label htmlFor="focalName" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Focal Person Name</label>
                    <input
                      type="text"
                      id="focalName"
                      value={focalName}
                      onChange={(e) => setFocalName(e.target.value)}
                      placeholder="Enter new name..."
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="focalPhone" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Phone Number</label>
                    <input
                      type="tel"
                      id="focalPhone"
                      value={focalPhone}
                      onChange={(e) => setFocalPhone(e.target.value)}
                      placeholder="e.g. +234..."
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="focalEmail" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Email Address</label>
                    <input
                      type="email"
                      id="focalEmail"
                      value={focalEmail}
                      onChange={(e) => setFocalEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-3 bg-gray-50/50"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium italic">Note: Fields left blank will remain unchanged on the projects.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-nasida-green-900 text-base font-black text-white hover:bg-opacity-90 focus:outline-none sm:w-auto sm:text-sm transition-all active:scale-95"
              onClick={handleConfirm}
              title="Apply updates to all selected projects"
            >
              Update {selectedCount} Projects
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-black text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
              title="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;
