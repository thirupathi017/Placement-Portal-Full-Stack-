import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, IndianRupee, Briefcase, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobTypeBadge from './JobTypeBadge';

const JobCard = ({ job, onApply, isApplied, isVerified = true }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="card hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 font-bold text-xl">
              {job.companyName ? job.companyName.charAt(0) : 'C'}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
              <p className="text-slate-500 text-sm font-medium">{job.companyName}</p>
            </div>
          </div>
          <JobTypeBadge type={job.jobType} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin size={16} className="mr-2 text-primary-500" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <IndianRupee size={16} className="mr-2 text-emerald-500" />
            <span className="font-semibold">{job.packageLpa} LPA</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Calendar size={16} className="mr-2 text-amber-500" />
            <span>Apply by {new Date(job.lastDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Briefcase size={16} className="mr-2 text-blue-500" />
            <span>Min CGPA: {job.eligibilityCgpa}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.eligibleDepartments.split(',').map(dept => (
            <span key={dept} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {dept.trim()}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex space-x-3">
        <Link 
          to={`/jobs/${job.id}`}
          className="btn btn-secondary flex-1 text-center py-2 text-sm"
        >
          View Details
        </Link>
        <button 
          onClick={() => onApply(job.id)}
          disabled={isApplied || job.status !== 'OPEN'}
          className={`btn flex-1 py-2 text-sm flex items-center justify-center space-x-2 ${
            isApplied 
              ? 'bg-emerald-500 text-white cursor-not-allowed border-none hover:bg-emerald-500 opacity-100' 
              : !isVerified
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'btn-primary'
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle size={16} />
              <span>Applied</span>
            </>
          ) : !isVerified ? (
            <span>Verification Pending</span>
          ) : (
            <span>{job.status === 'OPEN' ? 'Apply Now' : 'Closed'}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default JobCard;