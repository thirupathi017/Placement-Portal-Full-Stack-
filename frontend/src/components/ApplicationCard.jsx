import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Building2, FileText, IndianRupee } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({ application }) => {
  const resumeHref = application.resumeUrl
    ? (application.resumeUrl.startsWith('http')
        ? application.resumeUrl
        : `http://localhost:8080${application.resumeUrl}`)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      {/* Icon */}
      <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl self-start sm:self-center">
        <Building2 size={22} />
      </div>

      {/* Main info — grows to fill space */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base truncate">{application.jobTitle}</h3>
        <p className="text-sm text-slate-500 font-medium truncate">{application.companyName}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          {application.packageLpa && (
            <span className="flex items-center text-xs text-emerald-600 font-bold">
              <IndianRupee size={12} className="mr-0.5" />
              {application.packageLpa} LPA
            </span>
          )}
          <span className="flex items-center text-xs text-slate-400">
            <Calendar size={12} className="mr-1" />
            {new Date(application.appliedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Right side: status badge + resume link stacked */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
        <StatusBadge status={application.status} />
        {resumeHref ? (
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary-600 hover:text-primary-700 font-semibold text-xs whitespace-nowrap"
          >
            <FileText size={14} className="mr-1" />
            Resume
          </a>
        ) : (
          <span className="text-xs text-slate-300 italic">No resume</span>
        )}
      </div>
    </motion.div>
  );
};

export default ApplicationCard;
