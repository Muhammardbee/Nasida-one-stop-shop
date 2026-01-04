
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, ProjectStage, InvestmentType } from '../types';
import { STAGE_COLORS, STAGE_BG_COLORS, STAGE_PROGRESS, INVESTMENT_TYPE_OPTIONS } from '../constants';
import { 
    CurrencyDollarIcon, 
    UserGroupIcon, 
    BriefcaseIcon, 
    XMarkIcon, 
    MapPinIcon, 
    ClockIcon, 
    FlagIcon,
    PresentationChartLineIcon,
    PlayIcon,
    ChevronDownIcon
} from './icons';

interface DisplayDashboardProps {
  projects: Project[];
  onClose: () => void;
}

const SLIDE_DURATION = 10000; 

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

  const stats = useMemo(() => {
    const totalWorth = projects.reduce((sum, p) => sum + (p.investmentWorth || 0), 0);
    const totalJobs = projects.reduce((sum, p) => sum + (p.jobsToBeCreated || 0), 0);
    const activeProjects = projects.length;
    
    const stageCounts = projects.reduce((acc, p) => {
      acc[p.projectStage] = (acc[p.projectStage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sectors = projects.reduce((acc, p) => {
      const sector = p.projectSector || 'Other';
      acc[sector] = (acc[sector] || 0) + (p.investmentWorth || 0);
      return acc;
    }, {} as Record<string, number>);

    const topSectors = Object.entries(sectors)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 4);

    return { totalWorth, totalJobs, activeProjects, stageCounts, topSectors };
  }, [projects]);

  const featuredProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [projects]);

  const totalSlides = 3 + featuredProjects.length;

  const nextSlide = useCallback(() => {
    setSlideIndex(s => (s + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setSlideIndex(s => (s - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPaused(p => !p);
        e.preventDefault();
      } else if (e.code === 'ArrowRight') {
        nextSlide();
      } else if (e.code === 'ArrowLeft') {
        prevSlide();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  useEffect(() => {
    if (isPaused) return;
    const tickRate = 100;
    const increment = (tickRate / SLIDE_DURATION) * 100;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, tickRate);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const renderSlide = () => {
    if (slideIndex === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-700 w-full max-w-6xl mx-auto">
           <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-[#FFCC00] rounded-full animate-pulse shadow-[0_0_8px_#FFCC00]"></div>
                <span className="text-[#FFCC00] font-semibold text-[10px] uppercase tracking-[0.4em]">Investment Command Center</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight">Executive Summary</h2>
              <div className="h-1 w-20 bg-[#FFCC00]/50 mx-auto rounded-full"></div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full px-6">
              {[
                { label: 'Total Portfolio Worth', val: formatCurrency(stats.totalWorth), icon: CurrencyDollarIcon, color: 'text-[#FFCC00]', bg: 'bg-[#FFCC00]/10' },
                { label: 'Employment Potential', val: stats.totalJobs.toLocaleString(), icon: UserGroupIcon, color: 'text-white', bg: 'bg-white/10' },
                { label: 'Strategic Projects', val: stats.activeProjects, icon: BriefcaseIcon, color: 'text-white', bg: 'bg-white/10' }
              ].map((item, i) => (
                <div key={i} className="bg-black/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col items-center group transition-all duration-500 hover:bg-black/20">
                   <div className={`p-5 rounded-2xl mb-6 ${item.bg} ${item.color} group-hover:scale-105 transition-transform`}>
                      <item.icon className="w-10 h-10 sm:w-12 sm:h-12" />
                   </div>
                   <span className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] mb-2">{item.label}</span>
                   <span className="text-3xl sm:text-5xl font-bold text-white tabular-nums tracking-tighter">{item.val}</span>
                </div>
              ))}
           </div>
        </div>
      );
    }

    if (slideIndex === 1) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full max-w-6xl mx-auto animate-in fade-in slide-in-from-right duration-700 w-full px-8">
           <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight uppercase tracking-tight text-center lg:text-left">
                Pipeline <span className="text-[#FFCC00]">Progression</span>
              </h2>
              <div className="space-y-4 bg-black/10 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                 {Object.entries(stats.stageCounts).sort().map(([stage, count]) => (
                   <div key={stage} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{stage}</span>
                         <span className="text-xl sm:text-2xl font-bold text-[#FFCC00]">{count}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-[#FFCC00] rounded-full transition-all duration-1000"
                            style={{ width: `${((count as number) / stats.activeProjects) * 100}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="hidden lg:flex justify-center relative">
              <div className="relative w-72 h-72">
                 <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                    <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></circle>
                    <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#FFCC00" strokeWidth="3" strokeDasharray="75 25" className="animate-[dash_15s_linear_infinite]"></circle>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">98%</span>
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.3em] mt-1">Growth Index</span>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (slideIndex === 2) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 animate-in fade-in slide-in-from-bottom duration-700 w-full px-8 max-w-6xl mx-auto">
           <div className="space-y-2">
              <span className="text-[#FFCC00] font-semibold text-[10px] uppercase tracking-[0.4em] mb-1 block">Sector Allocation</span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight">Key Economic Verticals</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {stats.topSectors.map(([name, worth]) => (
                <div key={name} className="bg-black/10 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 flex flex-col items-center group transition-all duration-500 hover:bg-black/20">
                   <div className="p-4 bg-white/5 rounded-2xl mb-6 text-[#FFCC00]"><BriefcaseIcon className="w-10 h-10" /></div>
                   <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4 text-center h-10 flex items-center leading-tight">{name}</h4>
                   <span className="text-2xl font-bold text-white">{formatCurrency(worth as number)}</span>
                   <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFCC00]/50" style={{ width: `${((worth as number) / stats.totalWorth) * 100}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      );
    }

    const project = featuredProjects[slideIndex - 3];
    if (!project) return null;
    const progressVal = STAGE_PROGRESS[project.projectStage] || 0;

    return (
      <div className="flex flex-col items-center justify-center h-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-700 w-full px-8" key={project.id}>
         <div className="text-center space-y-2">
            <span className="px-4 py-1.5 bg-[#FFCC00]/10 text-[#FFCC00] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full border border-[#FFCC00]/20 inline-block mb-1">Strategic Spotlight</span>
            <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tight uppercase leading-none drop-shadow-xl">{project.projectName}</h2>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-black/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 space-y-8 shadow-2xl">
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-white/5 rounded-2xl text-[#FFCC00]"><MapPinIcon className="w-8 h-8" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Administrative LGA</p>
                        <p className="text-xl sm:text-2xl font-bold text-white truncate">{project.projectLocation}, Nasarawa</p>
                    </div>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="p-4 bg-white/5 rounded-2xl text-white/40"><BriefcaseIcon className="w-8 h-8" /></div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1">Industry Sector</p>
                        <p className="text-xl sm:text-2xl font-bold text-white truncate">{project.projectSector}</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Status: {project.projectStage}</span>
                      <span className="text-lg font-bold text-white">{progressVal}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFCC00] rounded-full transition-all duration-1000 shadow-[0_0_10px_#FFCC00]/30" style={{ width: `${progressVal}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               <div className="bg-gradient-to-br from-white/5 to-transparent p-10 rounded-[2.5rem] border border-white/10 flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-[#FFCC00] uppercase font-bold tracking-[0.2em] mb-2">Investment Capital</p>
                    <p className="text-4xl sm:text-6xl font-bold text-white tracking-tighter">{formatCurrency(project.investmentWorth)}</p>
                  </div>
                  <CurrencyDollarIcon className="w-12 h-12 text-white/10 group-hover:text-[#FFCC00]/30 transition-colors" />
               </div>
               <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em] mb-2">Employment Potential</p>
                    <p className="text-4xl sm:text-6xl font-bold text-white tracking-tighter">{project.jobsToBeCreated.toLocaleString()} <span className="text-sm font-semibold opacity-40">Jobs</span></p>
                  </div>
                  <UserGroupIcon className="w-12 h-12 text-white/10" />
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#005a35] flex flex-col overflow-hidden select-none font-sans">
      {/* Background Polish */}
      <div className="absolute inset-0 bg-hero-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-black/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* HEADER: MATCHES APP HEADER COLOR */}
      <header className="px-6 sm:px-12 h-20 sm:h-24 flex justify-between items-center relative z-20 bg-[#006A3E] shadow-xl">
         <div className="flex items-center space-x-6">
            <a href="https://nasida.na.gov.ng/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://nasida.na.gov.ng/img/nasida-logo.0ba663ba.svg" 
                alt="NASIDA" 
                className="h-10 sm:h-16 invert brightness-0 object-contain cursor-pointer hover:opacity-80 transition-opacity" 
              />
            </a>
            <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
            <div className="hidden sm:block">
                <div className="flex items-center space-x-3">
                   <h1 className="text-white font-bold uppercase tracking-[0.2em] text-xs sm:text-lg">One-Stop Shop</h1>
                   <div className="px-2 py-0.5 bg-[#FFCC00] text-[#006A3E] text-[8px] font-black rounded uppercase tracking-tighter animate-pulse shadow-md">Live</div>
                </div>
                <p className="text-[9px] text-white/50 uppercase font-semibold tracking-widest mt-1">Real-Time Investment Data Stream</p>
            </div>
         </div>
         
         <div className="flex items-center space-x-8">
            <div className="text-right hidden md:block">
               <p className="text-white font-bold text-2xl tracking-tighter leading-none">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               <p className="text-[10px] text-[#FFCC00] uppercase font-bold tracking-[0.3em] mt-1">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10 active:scale-90 group"
            >
                <XMarkIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-90 transition-transform" />
            </button>
         </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-grow flex items-center justify-center p-6 relative z-10 overflow-hidden">
         {renderSlide()}
      </main>

      {/* TICKER */}
      <div className="relative z-20 w-full bg-black/20 border-t border-white/5 py-3 backdrop-blur-xl overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="flex whitespace-nowrap animate-[marquee_100s_linear_infinite] hover:[animation-play-state:paused]">
           {[...projects, ...projects].map((p, idx) => (
             <div key={`${p.id}-${idx}`} className="inline-flex items-center mx-12">
                <span className={`w-2.5 h-2.5 rounded-full mr-4 ${STAGE_BG_COLORS[p.projectStage]} shadow-sm`}></span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mr-3">{p.projectLocation}:</span>
                <span className="text-[11px] font-semibold text-white uppercase tracking-tight mr-5">{p.projectName}</span>
                <span className="text-[11px] font-bold text-[#FFCC00] tabular-nums">{formatCurrency(p.investmentWorth)}</span>
             </div>
           ))}
        </div>
      </div>

      {/* FOOTER NAV */}
      <footer className="px-10 h-20 sm:h-24 flex justify-between items-center relative z-20 border-t border-white/5 bg-black/10">
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               {Array.from({ length: totalSlides }).map((_, i) => (
                 <button 
                    key={i} 
                    onClick={() => { setSlideIndex(i); setProgress(0); }}
                    className={`h-1 rounded-full transition-all duration-500 ${slideIndex === i ? 'w-10 bg-[#FFCC00]' : 'w-2 bg-white/10'}`}
                 />
               ))}
            </div>
            <span className="text-white/20 text-[9px] font-bold uppercase tracking-widest">
               Frame {slideIndex + 1} / {totalSlides}
            </span>
         </div>

         <div className="flex items-center space-x-4">
            <button 
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full border border-white/10 transition-all text-white font-bold text-[10px] uppercase tracking-widest active:scale-95 group"
            >
                {isPaused ? <PlayIcon className="w-4 h-4 text-[#FFCC00]" /> : <ClockIcon className="w-4 h-4 text-[#FFCC00]" />}
                <span>{isPaused ? 'Manual Selection' : 'Auto Intel Mode'}</span>
            </button>
         </div>

         {/* PROGRESS BAR STRIP */}
         <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-transparent via-[#FFCC00] to-transparent transition-all duration-100 ease-linear shadow-[0_0_10px_#FFCC00]/50"
              style={{ width: `${progress}%` }}
            />
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes dash { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: -100; } }
      `}} />
    </div>
  );
};

export default DisplayDashboard;
