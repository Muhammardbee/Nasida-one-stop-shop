
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { XMarkIcon, ExclamationTriangleIcon } from './icons';

interface DeleteConfirmationModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (projectId: string) => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ project, isOpen, onClose, onConfirm }) => {
  const [confirmName, setConfirmName] = useState('');

  // Reset confirmation input when modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      setConfirmName('');
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const isConfirmed = confirmName.trim() === project.projectName.trim();

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          <div className="bg-red-50 px-6 py-4 flex items-center border-b border-red-100">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900" id="modal-title">
              Delete Project
            </h3>
            <button 
                type="button" 
                className="ml-auto bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{project.projectName}"</span>? This action cannot be undone.
            </p>
            
            <div className="space-y-2">
              <label htmlFor="confirm-delete" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Type the project name to confirm:
              </label>
              <input
                type="text"
                id="confirm-delete"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={project.projectName}
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="button"
              disabled={!isConfirmed}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white transition-all sm:w-auto sm:text-sm ${
                isConfirmed 
                ? 'bg-red-600 hover:bg-red-700 focus:outline-none' 
                : 'bg-gray-300 cursor-not-allowed opacity-60'
              }`}
              onClick={() => onConfirm(project.id)}
            >
              Confirm Delete
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
