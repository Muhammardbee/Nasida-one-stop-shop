
import React, { useState } from 'react';
import { UserCircleIcon } from './icons';
import { User, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLogin: (username: string, role: UserRole) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = username.trim().toLowerCase();
    
    const foundUser = users.find(u => u.username.toLowerCase() === normalizedUser && u.password === password);
    
    if (foundUser) {
      onLogin(foundUser.username, foundUser.role);
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full sm:p-8">
          <div className="sm:flex sm:items-start justify-center">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-nasida-green-900/10 sm:mx-0 sm:h-12 sm:w-12 mb-6 sm:mb-0">
              <UserCircleIcon className="h-8 w-8 text-nasida-green-900" />
            </div>
          </div>
          <div className="text-center mt-3 sm:mt-5">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight" id="modal-title">System Access</h3>
            <p className="mt-2 text-sm text-gray-500 font-medium">Please enter your authorized credentials.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
                <input
                  type="text"
                  id="username"
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 border transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                <input
                  type="password"
                  id="password"
                  className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 border transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

            <div className="grid grid-cols-2 gap-4 mt-8">
               <button type="button" className="flex justify-center rounded-xl border border-gray-200 shadow-sm px-4 py-3 bg-white text-sm font-black text-gray-700 hover:bg-gray-50 transition-all" onClick={onClose}>Cancel</button>
               <button type="submit" className="flex justify-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-nasida-green-900 text-sm font-black text-white hover:bg-opacity-90 transition-all active:scale-95">Sign In</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
