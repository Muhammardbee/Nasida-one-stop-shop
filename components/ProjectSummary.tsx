
import React, { useMemo, useState } from 'react';
import { Project, ProjectStage, InvestmentType } from '../types';
import { PROJECT_STAGE_OPTIONS, STAGE_BG_COLORS, INVESTMENT_TYPE_OPTIONS } from '../constants';
import { ChartBarIcon, CurrencyDollarIcon, UserGroupIcon, BriefcaseIcon, ChevronDownIcon, ClockIcon } from './icons';

interface ProjectSummaryProps {
  projects: Project[];
}

const formatCurrencyCompact = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
};

const formatCurrencyFull = (value: number) => {
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

// Hex colors corresponding to STAGE_BG_COLORS for SVG
const STAGE_HEX_COLORS: Record<ProjectStage, string> = {
  [ProjectStage.INITIATION]: '#3b82f6', // blue-500
  [ProjectStage.MOU_SIGNED]: '#eab308', // yellow-500
  [ProjectStage.MOVED_TO_SITE]: '#a855f7', // purple-500
  [ProjectStage.COMPLETED]: '#22c55e', // green-500
};

// Metadata for Lifecycle Stages
const STAGE_METADATA: Record<ProjectStage, { milestones: string[], duration: string }> = {
  [ProjectStage.INITIATION]: {
    milestones: ['Profiling', 'Briefing'],
    duration: '2-4w'
  },
  [ProjectStage.MOU_SIGNED]: {
    milestones: ['Review', 'Signing'],
    duration: '1-3m'
  },
  [ProjectStage.MOVED_TO_SITE]: {
    milestones: ['Groundbreaking', 'Civil'],
    duration: '6-18m'
  },
  [ProjectStage.COMPLETED]: {
    milestones: ['Launch'],
    duration: 'Final'
  }
};

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ projects }) => {
  const [hoveredStage, setHoveredStage] = useState<ProjectStage | null>(null);

  const stageCounts = useMemo(() => PROJECT_STAGE_OPTIONS.reduce((acc, stageOpt) => {
    acc[stageOpt.value as ProjectStage] = projects.filter(p => p.projectStage === stageOpt.value).length;
    return acc;
  }, {} as Record<ProjectStage, number>), [projects]);

  const investmentTypeAmounts = useMemo(() => INVESTMENT_TYPE_OPTIONS.reduce((acc, typeOpt) => {
      acc[typeOpt.value as InvestmentType] = projects
        .filter(p => p.investmentType === typeOpt.value)
        .reduce((sum, p) => sum + (p.investmentWorth || 0), 0);
      return acc;
  }, {} as Record<InvestmentType, number>), [projects]);

  // Sector Aggregation
  const sectorData = useMemo(() => {
    const sectors: Record<string, { count: number; totalWorth: number }> = {};
    projects.forEach(p => {
      const sector = p.projectSector || 'Unspecified';
      if (!sectors[sector]) {
        sectors[sector] = { count: 0, totalWorth: 0 };
      }
      sectors[sector].count += 1;
      sectors[sector].totalWorth += p.investmentWorth || 0;
    });
    return Object.entries(sectors)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalWorth - a.totalWorth);
  }, [projects]);

  const totalProjects = projects.length;
  
  const totalInvestment = projects.reduce((sum, p) => sum + (p.investmentWorth || 0), 0);
  const totalJobs = projects.reduce((sum, p) => sum + (p.jobsToBeCreated || 0), 0);

  const maxInvestment = Math.max(...(Object.values(investmentTypeAmounts) as number[]), 0) || 1;
  const maxSectorWorth = Math.max(...(sectorData.map(s => s.totalWorth) as number[]), 0) || 1;

  // Donut Chart Data Preparation
  const donutSegments = useMemo(() => {
    let cumulativePercentage = 0;
    return PROJECT_STAGE_OPTIONS.map((stageOpt) => {
      const stage = stageOpt.value as ProjectStage;
      const count = stageCounts[stage] || 0;
      const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
      const startPercentage = cumulativePercentage;
      cumulativePercentage += percentage;
      
      return {
        stage,
        label: stageOpt.label,
        count,
        percentage,
        startPercentage,
        color: STAGE_HEX_COLORS[stage]
      };
    });
  }, [stageCounts, totalProjects]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border-l-4 border-nasida-green-900 group hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-1">Investment</p>
                    <p className="text-lg sm:text-xl font-black text-nasida-green-900 truncate" title={formatCurrencyFull(totalInvestment)}>
                        {formatCurrencyCompact(totalInvestment)}
                    </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-xl flex-shrink-0 ml-2 group-hover:scale-110 transition-transform">
                    <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nasida-green-900" />
                </div>
            </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border-l-4 border-nasida-green-500 group hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-1">Target Jobs</p>
                    <p className="text-lg sm:text-xl font-black text-gray-800 truncate">{formatNumber(totalJobs)}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-xl flex-shrink-0 ml-2 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nasida-green-500" />
                </div>
            </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border-l-4 border-blue-500 group hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-1">Projects</p>
                    <p className="text-lg sm:text-xl font-black text-gray-800 truncate">{totalProjects}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0 ml-2 group-hover:scale-110 transition-transform">
                    <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
            </div>
        </div>
      </div>

      {/* Pipeline Distribution - Donut Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <div className="p-1.5 bg-nasida-green-900/10 rounded-lg mr-2">
                <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nasida-green-900" />
            </div>
            Pipeline Distribution
        </h2>

        {totalProjects === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <p className="text-gray-400 text-xs italic">No data available.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 mb-4 sm:mb-6">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f4f6" strokeWidth="6"></circle>
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.stage}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredStage === seg.stage ? "8" : "6"}
                    strokeDasharray={`${seg.percentage} ${100 - seg.percentage}`}
                    strokeDashoffset={-seg.startPercentage}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredStage(seg.stage)}
                    onMouseLeave={() => setHoveredStage(null)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                {hoveredStage ? (
                  <>
                    <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 truncate w-full">
                      {hoveredStage}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
                      {stageCounts[hoveredStage]}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                      Total
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-nasida-green-900 leading-none">
                      {totalProjects}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4 sm:gap-x-6 w-full px-1">
              {donutSegments.map((seg) => (
                <div 
                  key={seg.stage} 
                  className={`flex items-center transition-all duration-200 ${hoveredStage === seg.stage ? 'scale-105' : ''}`}
                  onMouseEnter={() => setHoveredStage(seg.stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  <div className="w-2.5 h-2.5 rounded-sm mr-2 shadow-sm flex-shrink-0" style={{ backgroundColor: seg.color }}></div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[8px] sm:text-[10px] font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-0.5">
                      {seg.label}
                    </span>
                    <span className="text-[7px] sm:text-[9px] font-bold text-gray-400 tabular-nums">
                      {seg.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sector Distribution Visualization */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <div className="p-1.5 bg-nasida-green-900/10 rounded-lg mr-2">
                <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nasida-green-900" />
            </div>
            Sectors
        </h2>

        {sectorData.length === 0 ? (
          <div className="py-8 text-center">
             <p className="text-gray-400 text-xs italic">No sector data.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {sectorData.slice(0, 8).map((sector) => {
              const widthPct = (sector.totalWorth / maxSectorWorth) * 100;
              return (
                <div key={sector.name} className="group">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <div className="flex items-center space-x-2 overflow-hidden mr-2">
                      <span className="text-[10px] sm:text-xs font-black text-gray-800 truncate uppercase tracking-tight">{sector.name}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-nasida-green-900 tabular-nums">
                      {formatCurrencyCompact(sector.totalWorth)}
                    </span>
                  </div>
                  <div className="relative w-full h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-nasida-green-900 to-nasida-green-500 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110"
                      style={{ width: `${Math.max(widthPct, 1.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Lifecycle Pipeline */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 flex items-center">
                <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-nasida-green-900" />
                Pipeline
            </h2>
        </div>

        {totalProjects === 0 ? (
          <div className="py-4 text-center">
             <p className="text-gray-400 text-xs italic">No projects.</p>
          </div>
        ) : (
          <div className="relative pl-1">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>

            <div className="space-y-6 sm:space-y-8">
              {PROJECT_STAGE_OPTIONS.map((stageOpt) => {
                const stage = stageOpt.value as ProjectStage;
                const count = stageCounts[stage];
                const meta = STAGE_METADATA[stage];

                return (
                  <div key={stage} className="relative flex items-start group">
                    <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-[3px] sm:border-4 border-white shadow-md flex items-center justify-center transition-all group-hover:scale-110 ${count > 0 ? STAGE_BG_COLORS[stage] : 'bg-gray-200'}`}>
                        {count > 0 && <span className="text-[8px] sm:text-[10px] font-black text-white">{count}</span>}
                    </div>

                    <div className="ml-4 sm:ml-6 flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-[10px] sm:text-sm font-black uppercase tracking-tight ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            {stageOpt.label}
                        </h3>
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 italic">{meta.duration}</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-50 rounded-full h-1 overflow-hidden">
                        <div
                            className={`${STAGE_BG_COLORS[stage]} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: totalProjects > 0 ? `${(count / totalProjects) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Investment Strategy Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <div className="p-1.5 bg-nasida-green-900/10 rounded-lg mr-2">
                <CurrencyDollarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-nasida-green-900" />
            </div>
            Strategy
        </h2>
        
        {totalProjects === 0 ? (
           <div className="py-8 text-center">
                <p className="text-gray-400 text-xs italic">Add data.</p>
           </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-end justify-between h-32 sm:h-48 px-1 border-b border-gray-200 gap-2 sm:gap-4">
                    {INVESTMENT_TYPE_OPTIONS.map(typeOpt => {
                        const amount = investmentTypeAmounts[typeOpt.value] || 0;
                        const heightPercentage = (amount / maxInvestment) * 100;
                        
                        return (
                            <div key={typeOpt.value} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-nasida-green-900 text-white text-[8px] sm:text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                                    {formatCurrencyFull(amount)}
                                </div>
                                <div 
                                    className="w-full bg-gradient-to-t from-nasida-green-900 to-nasida-green-700 rounded-t-md sm:rounded-t-lg transition-all duration-1000 shadow-sm"
                                    style={{ height: `${Math.max(heightPercentage, amount > 0 ? 5 : 0)}%` }}
                                />
                                <div className="mt-2 text-center">
                                    <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase block leading-none">
                                        {typeOpt.value}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                    {INVESTMENT_TYPE_OPTIONS.map(typeOpt => {
                        const amount = investmentTypeAmounts[typeOpt.value] || 0;
                        return (
                            <div key={typeOpt.value} className="flex items-center justify-between text-[10px] sm:text-xs">
                                <div className="flex items-center overflow-hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-nasida-green-900 mr-2 flex-shrink-0"></div>
                                    <span className="text-gray-600 font-medium truncate">{typeOpt.label.split(' (')[0]}</span>
                                </div>
                                <span className="font-black text-gray-900 ml-2">{formatCurrencyCompact(amount)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSummary;
