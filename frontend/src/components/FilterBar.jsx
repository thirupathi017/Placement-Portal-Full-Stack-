import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onSearch }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="relative flex-grow w-full md:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          name="companyName"
          placeholder="Search jobs or companies..."
          className="input pl-10"
          value={filters.companyName}
          onChange={handleChange}
        />
      </div>

      <select 
        name="jobType" 
        className="input w-full md:w-40"
        value={filters.jobType}
        onChange={handleChange}
      >
        <option value="">All Types</option>
        <option value="FULL_TIME">Full Time</option>
        <option value="INTERNSHIP">Internship</option>
        <option value="CONTRACT">Contract</option>
      </select>

      <select 
        name="dept" 
        className="input w-full md:w-48"
        value={filters.dept}
        onChange={handleChange}
      >
        <option value="">All Departments</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Information Technology">IT</option>
        <option value="Electronics">Electronics</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Artificial Intelligence">Artificial Intelligence</option>
        <option value="Agriculture">Agriculture</option>
      </select>

      <div className="flex items-center space-x-2 w-full md:w-auto">
        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Min LPA:</span>
        <input
          type="number"
          name="minPackage"
          className="input flex-1 md:w-24"
          placeholder="0"
          value={filters.minPackage}
          onChange={handleChange}
        />
      </div>

      <button 
        onClick={onSearch}
        className="btn btn-primary w-full md:w-auto flex items-center justify-center space-x-2"
      >
        <SlidersHorizontal size={18} />
        <span>Filter</span>
      </button>
    </div>
  );
};

export default FilterBar;
