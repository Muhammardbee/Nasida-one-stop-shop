
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { XMarkIcon, UserPlusIcon, TrashIcon, ShieldCheckIcon } from './icons';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  onAddUser, 
  onDeleteUser, 
  onUpdateRole 
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.VIEWER);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Both username and password are required.');
      return;
    }
    if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase().trim())) {
      setError('Username already exists.');
      return;
    }

    onAddUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole
    });

    setNewUsername('');
    setNewPassword('');
    setNewRole(UserRole.VIEWER);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[140] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
          
          <div className="bg-nasida-green-900 px-6 py-4 flex justify-between items-center border-b border-nasida-green-800">
            <h3 className="text-xl font-black text-white flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-3" />
              System User Management
            </h3>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create User Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" /> Create New Account
                </h4>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 border"
                      placeholder="e.g. jdoe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Initial Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 border"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assigned Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 border bg-white"
                    >
                      <option value={UserRole.VIEWER}>Viewer (Read-only)</option>
                      <option value={UserRole.EDITOR}>Editor (Can edit projects)</option>
                      <option value={UserRole.ADMIN}>Admin (Full system access)</option>
                    </select>
                  </div>
                  {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
                  <button type="submit" className="w-full bg-nasida-green-900 text-white py-3 rounded-xl font-black text-sm shadow-lg hover:bg-opacity-90 active:scale-95 transition-all">
                    Create User
                  </button>
                </form>
              </div>
            </div>

            {/* Users Table */}
            <div className="lg:col-span-2 overflow-hidden flex flex-col">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Existing Users</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden overflow-y-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Created</th>
                      <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary font-bold uppercase">
                              {user.username[0]}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                            className={`text-xs font-bold rounded-lg px-2 py-1 border-0 focus:ring-2 focus:ring-primary ${
                              user.role === UserRole.ADMIN ? 'bg-red-50 text-red-700' : 
                              user.role === UserRole.EDITOR ? 'bg-blue-50 text-blue-700' : 
                              'bg-gray-50 text-gray-700'
                            }`}
                          >
                            <option value={UserRole.ADMIN}>ADMIN</option>
                            <option value={UserRole.EDITOR}>EDITOR</option>
                            <option value={UserRole.VIEWER}>VIEWER</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            disabled={user.username === 'admin'}
                            className={`p-2 rounded-lg transition-colors ${user.username === 'admin' ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
