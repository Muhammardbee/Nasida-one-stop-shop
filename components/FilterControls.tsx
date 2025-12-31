import React from 'react';
import { ProjectStage } from '../types';
import { PROJECT_STAGE_OPTIONS, ALL_STAGES_FILTER, ALL_SECTORS_FILTER } from '../constants';
import { ChevronDownIcon } from './icons';

interface FilterControlsProps {
  stageFilter: ProjectStage | typeof ALL_STAGES_FILTER;
  setStageFilter: (stage: ProjectStage | typeof ALL_STAGES_FILTER) => void;
  sectorFilter: string | typeof ALL_SECTORS_FILTER;
  setSectorFilter: (sector: string | typeof ALL_SECTORS_FILTER) => void;
  availableSectors: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  stageFilter,
  setStageFilter,
  sectorFilter,
  setSectorFilter,
  availableSectors,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="stageFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Stage
          </label>
          <div className="relative">
            <select
              id="stageFilter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as ProjectStage | typeof ALL_STAGES_FILTER)}
              className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary shadow-sm sm:text-sm"
            >
              <option value={ALL_STAGES_FILTER}>All Stages</option>
              {PROJECT_STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="w-4 h-4"/>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="sectorFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Sector
          </label>
           <div className="relative">
            <select
              id="sectorFilter"
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value as string | typeof ALL_SECTORS_FILTER)}
              className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary shadow-sm sm:text-sm"
            >
              <option value={ALL_SECTORS_FILTER}>All Sectors</option>
              {availableSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="w-4 h-4"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;