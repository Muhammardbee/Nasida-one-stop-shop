
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStage } from '../types';
import { STAGE_COLORS, STAGE_BG_COLORS, STAGE_PROGRESS } from '../constants';
import { 
    CurrencyDollarIcon, 
    UserGroupIcon, 
    BriefcaseIcon, 
    XMarkIcon, 
    MapPinIcon, 
    ClockIcon, 
    FlagIcon,
    PresentationChartLineIcon,
    PlayIcon
} from './icons';

interface DisplayDashboardProps {
  projects: Project[];
  onClose: () => void;
}

const SLIDE_DURATION = 10000; // 10 seconds per slide

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

const DisplayDashboard: React.FC<DisplayDashboardProps> = ({ projects, onClose }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Statistics
  const stats = useMemo(() => {
    const totalWorth = projects.reduce((sum, p) => sum + (p.investmentWorth || 0), 0);
    const totalJobs = projects.reduce((sum, p) => sum + (p.jobsToBeCreated || 0), 0);
    const activeProjects = projects.length;
    
    const stageCounts = projects.reduce((acc, p) => {
      acc[p.projectStage] = (acc[p.projectStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalWorth, totalJobs, activeProjects, stageCounts };
  }, [projects]);

  // Featured Projects (Last 5 modified)
  const featuredProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [projects]);

  const totalSlides = 2 + featuredProjects.length;

  useEffect(() => {
    if (isPaused) return;

    const tickRate = 100;
    const increment = (tickRate / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setSlideIndex(s => (s + 1) % totalSlides);
          return 0;
        }
        return prev + increment;
      });
    }, tickRate);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const renderSlide = () => {
    if (slideIndex === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-in fade-in zoom-in duration-700">
           <div className="space-y-4">
              <h2 className="text-3xl font-black text-green-400 uppercase tracking-[0.2em]">Portfolio Overview</h2>
              <div className="h-1 w-24 bg-green-400 mx-auto rounded-full"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl">
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                 <div className="p-4 bg-green-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <CurrencyDollarIcon className="w-12 h-12 text-green-400" />
                 </div>
                 <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Total Worth</span>
                 <span className="text-7xl font-black text-white tabular-nums">{formatCurrency(stats.totalWorth)}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                 <div className="p-4 bg-blue-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-12 h-12 text-blue-400" />
                 </div>
                 <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Target Jobs</span>
                 <span className="text-7xl font-black text-white tabular-nums">{stats.totalJobs.toLocaleString()}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                 <div className="p-4 bg-purple-500/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <BriefcaseIcon className="w-12 h-12 text-purple-400" />
                 </div>
                 <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Active Projects</span>
                 <span className="text-7xl font-black text-white tabular-nums">{stats.activeProjects}</span>
              </div>
           </div>
        </div>
      );
    }

    if (slideIndex === 1) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full max-w-7xl mx-auto animate-in fade-in slide-in-from-right duration-700">
           <div className="space-y-8">
              <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tighter">Investment Pipeline Distribution</h2>
              <p className="text-xl text-gray-400 font-medium">Monitoring the lifecycle of Nasarawa's most strategic investments in real-time.</p>
              
              <div className="space-y-6 pt-8">
                 {Object.entries(stats.stageCounts).sort().map(([stage, count]) => (
                   <div key={stage} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-sm font-black text-white uppercase tracking-widest">{stage}</span>
                         <span className="text-2xl font-black text-green-400">{count}</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                            className={`h-full ${STAGE_BG_COLORS[stage as ProjectStage] || 'bg-green-500'} transition-all duration-1000`}
                            style={{ width: `${(count / stats.activeProjects) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                 <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
                    {/* Simplified donut visualization for large screen */}
                    <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray="60 40"></circle>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Growth</span>
                    <span className="text-5xl font-black text-white">Live</span>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    const project = featuredProjects[slideIndex - 2];
    const progressVal = STAGE_PROGRESS[project.projectStage] || 0;

    return (
      <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom duration-700" key={project.id}>
         <div className="text-center space-y-4">
            <span className="px-4 py-1.5 bg-green-500 text-white text-xs font-black uppercase tracking-[0.3em] rounded-full">Featured Project</span>
            <h2 className="text-6xl font-black text-white tracking-tighter uppercase">{project.projectName}</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="bg-white/5 backdrop-blur-lg p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl text-green-400"><MapPinIcon /></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Location</p>
                        <p className="text-lg font-bold text-white">{project.projectLocation}, {project.projectSubLocation || 'Nasarawa State'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-2xl text-blue-400"><BriefcaseIcon /></div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Industry Sector</p>
                        <p className="text-lg font-bold text-white">{project.projectSector}</p>
                    </div>
                </div>
                <div className="pt-4">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-2" /> Current Status: {project.projectStage}
                    </p>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                           className={`h-full ${STAGE_BG_COLORS[project.projectStage] || 'bg-green-500'} transition-all duration-1000`}
                           style={{ width: `${progressVal}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Impact Value</p>
                    <p className="text-4xl font-black text-green-400">{formatCurrency(project.investmentWorth)}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-full"><CurrencyDollarIcon className="w-8 h-8 text-green-400" /></div>
               </div>
               <div className="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">New Employment</p>
                    <p className="text-4xl font-black text-blue-400">{project.jobsToBeCreated.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-full"><UserGroupIcon className="w-8 h-8 text-blue-400" /></div>
               </div>
               {project.requiresFollowUp && (
                 <div className="bg-amber-500/10 backdrop-blur-lg p-4 rounded-2xl border border-amber-500/20 flex items-center text-amber-400">
                    <FlagIcon className="w-5 h-5 mr-3 fill-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Executive Priority Project</span>
                 </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-nasida-green-900 flex flex-col overflow-hidden select-none">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-green-400/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 z-50">
         <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
         />
      </div>

      {/* Header Overlay */}
      <div className="p-8 flex justify-between items-center relative z-10">
         <div className="flex items-center space-x-6">
            <img src="https://nasida.na.gov.ng/img/nasida-logo.0ba663ba.svg" alt="NASIDA" className="h-16 invert brightness-0" />
            <div className="h-10 w-px bg-white/20"></div>
            <div>
                <h1 className="text-white font-black uppercase tracking-[0.2em] text-sm">Investment Command Center</h1>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Nasarawa Investment & Development Agency</p>
            </div>
         </div>
         
         <div className="flex items-center space-x-4">
            <div className="text-right mr-4 hidden sm:block">
               <p className="text-white font-black text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               <p className="text-[10px] text-gray-400 uppercase font-bold">{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90"
            >
                <XMarkIcon className="w-8 h-8" />
            </button>
         </div>
      </div>

      {/* Slide Content */}
      <div className="flex-grow flex items-center justify-center p-8 relative z-10 overflow-hidden">
         {renderSlide()}
      </div>

      {/* Footer Controls */}
      <div className="p-8 flex justify-between items-end relative z-10">
         <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
               {Array.from({ length: totalSlides }).map((_, i) => (
                 <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${slideIndex === i ? 'w-12 bg-green-400' : 'w-1.5 bg-white/20'}`}
                 />
               ))}
            </div>
            <div className="flex items-center space-x-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
               <span>Slide {slideIndex + 1} of {totalSlides}</span>
            </div>
         </div>

         <div className="flex items-center space-x-4">
            <button 
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl border border-white/10 transition-all text-white font-black text-xs uppercase tracking-widest"
            >
                {isPaused ? <PlayIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                <span>{isPaused ? 'Resume Rotation' : 'Auto-Rotating'}</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default DisplayDashboard;
