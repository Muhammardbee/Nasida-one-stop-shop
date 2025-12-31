
import React from 'react';
import { Project } from '../types';
import { ListBulletIcon, ChevronDownIcon, TrashIcon, ClockIcon } from './icons';
import { STAGE_COLORS } from '../constants';
import { ViewedProject } from '../App';

interface RecentlyViewedProps {
  recentlyViewed: ViewedProject[];
  allProjects: Project[];
  onProjectClick: (project: Project) => void;
  onClearHistory: () => void;
}

const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ 
  recentlyViewed, 
  allProjects, 
  onProjectClick,
  onClearHistory
}) => {
  // Map IDs to project objects and filter out any that might have been deleted
  const recentProjects = recentlyViewed
    .map(item => {
      const project = allProjects.find(p => p.id === item.id);
      return project ? { ...project, viewedAt: item.timestamp } : null;
    })
    .filter((p): p is Project & { viewedAt: number } => !!p);

  if (recentProjects.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center py-10">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <ClockIcon className="w-6 h-6 text-gray-300" />
        </div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Recent Activity</h3>
        <p className="text-xs text-gray-400 mt-1 px-4">Your recently viewed projects will appear here for quick access.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-left duration-500 overflow-hidden relative">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <div className="p-1.5 bg-nasida-green-900/10 rounded-lg mr-2 shadow-inner">
            <ClockIcon className="w-5 h-5 text-nasida-green-900" />
          </div>
          Recent Activity
        </h2>
        <button 
          onClick={onClearHistory}
          className="text-[10px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center group"
          title="Clear browsing history"
        >
          <TrashIcon className="w-3 h-3 mr-1 opacity-40 group-hover:opacity-100" />
          Clear
        </button>
      </div>
      
      <div className="space-y-3">
        {recentProjects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => onProjectClick(project)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all group flex items-center justify-between relative overflow-hidden ${
              index === 0 
                ? 'bg-nasida-green-900/[0.03] border-nasida-green-900/20 shadow-sm' 
                : 'bg-gray-50/20 border-gray-50 hover:border-primary/30 hover:bg-primary/[0.03]'
            }`}
            title={`View details for ${project.projectName}`}
          >
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-opacity ${
              index === 0 ? 'bg-nasida-green-900 opacity-100' : 'bg-primary opacity-0 group-hover:opacity-100'
            }`}></div>
            
            <div className="overflow-hidden mr-4">
              <div className="flex items-center mb-1 flex-wrap gap-2">
                 <p className={`text-sm font-black truncate transition-colors ${
                   index === 0 ? 'text-nasida-green-900' : 'text-gray-800 group-hover:text-primary'
                 }`}>
                    {project.projectName}
                 </p>
                 {index === 0 && (
                   <span className="flex-shrink-0 text-[7px] font-black bg-nasida-green-900 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                     Newest
                   </span>
                 )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                  {project.projectLocation}
                </span>
                <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                <span className="text-[9px] font-bold text-gray-400">
                  {getRelativeTime(project.viewedAt)}
                </span>
              </div>
            </div>
            <div className={`flex-shrink-0 transition-all transform ${
              index === 0 ? 'opacity-100' : 'opacity-20 group-hover:opacity-100 group-hover:translate-x-1'
            }`}>
              <ChevronDownIcon className="w-4 h-4 text-primary -rotate-90" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center">
            <div className="w-1 h-1 bg-primary/40 rounded-full mr-2"></div>
            Session Persisted
        </p>
        <span className="text-[9px] font-bold text-gray-300">{recentProjects.length}/6 Slots used</span>
      </div>
    </div>
  );
};

export default RecentlyViewed;
